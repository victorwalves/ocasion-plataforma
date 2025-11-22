import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { venueId, date, startTime, endTime, guestCount, selectedPackages, result } = body;

        const supabase = await createClient();

        // 1. Validate Availability
        // Extract just the date part YYYY-MM-DD
        const eventDate = date.split('T')[0];

        const { data: conflicts } = await supabase
            .from('bookings')
            .select('id')
            .eq('venue_id', venueId)
            .eq('event_date', eventDate)
            .neq('status', 'cancelled')
            // Simple overlap check:
            // Existing.Start < New.End AND Existing.End > New.Start
            .lt('start_time', endTime)
            .gt('end_time', startTime);

        if (conflicts && conflicts.length > 0) {
            return NextResponse.json(
                { error: 'Este horário já está reservado. Por favor, escolha outro.' },
                { status: 409 }
            );
        }

        // 2. Create Booking Record (Pending Payment)
        const { data: { user } } = await supabase.auth.getUser();

        let userId = user?.id;

        if (!userId) {
            return NextResponse.json({ error: 'Você precisa estar logado para reservar.' }, { status: 401 });
        }

        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                venue_id: venueId,
                user_id: userId,
                event_date: eventDate,
                start_time: startTime,
                end_time: endTime,
                guest_count: guestCount,
                selected_packages: selectedPackages,
                calculated_venue_cost: result.rentalFee,
                calculated_min_spend_gap: result.minSpendGap,
                calculated_extras_cost: result.ocasionExtras,
                total_amount: result.totalAmount,
                status: 'pending_payment'
            })
            .select()
            .single();

        if (bookingError) {
            console.error('Booking Error:', bookingError);
            return NextResponse.json({ error: 'Erro ao criar reserva.' }, { status: 500 });
        }

        // 3. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: 'Reserva de Espaço - Ocasion',
                            description: `Reserva para ${eventDate} das ${startTime} às ${endTime}`,
                        },
                        unit_amount: Math.round(result.totalAmount * 100), // Centavos
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '') || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '') || 'http://localhost:3000'}/venues/${venueId}`,
            metadata: {
                booking_id: booking.id,
            },
        });

        // 4. Update Booking with Session ID
        await supabase
            .from('bookings')
            .update({ stripe_session_id: session.id })
            .eq('id', booking.id);

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno no servidor' },
            { status: 500 }
        );
    }
}
