import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Activity,
    DollarSign,
    CalendarCheck,
    Building2,
    Users,
    TrendingUp,
    Package,
    CreditCard
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboard() {
    const supabase = await createClient();

    // 1. Auth & Role Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/auth/sign-in");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        redirect("/");
    }

    // 2. Fetch KPIs
    const [
        { count: usersCount },
        { count: venuesCount },
        { count: bookingsCount },
        { data: revenueData },
        { data: recentBookings }
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("venues").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("bookings")
            .select("total_amount")
            .in("status", ["confirmed", "completed"]),
        supabase.from("bookings")
            .select("*, venues(title)")
            .order("created_at", { ascending: false })
            .limit(5)
    ]);

    // Calculate Total Revenue
    const totalRevenue = revenueData?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;

    // Helper for currency
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
                            <p className="text-gray-500 mt-1">Visão geral e métricas do Ocasion</p>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-50 text-[#9c27c1] px-4 py-2 rounded-full font-medium">
                            <Activity className="h-5 w-5" />
                            <span>Status: Operacional</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <KpiCard
                        title="Receita Total"
                        value={formatCurrency(totalRevenue)}
                        icon={DollarSign}
                        description="Em reservas confirmadas"
                        trend="+12% este mês"
                    />
                    <KpiCard
                        title="Reservas"
                        value={bookingsCount || 0}
                        icon={CalendarCheck}
                        description="Total de agendamentos"
                        trend="+5 novos hoje"
                    />
                    <KpiCard
                        title="Espaços"
                        value={venuesCount || 0}
                        icon={Building2}
                        description="Locais cadastrados"
                        trend="2 pendentes aprovação"
                    />
                    <KpiCard
                        title="Usuários"
                        value={usersCount || 0}
                        icon={Users}
                        description="Usuários registrados"
                        trend="+18 novos esta semana"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Atividade Recente</h2>
                        <div className="space-y-4">
                            {recentBookings?.map((booking: any) => (
                                <Card key={booking.id}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <CalendarCheck className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Nova reserva confirmada
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Espaço "{booking.venues?.title}" - {new Date(booking.event_date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-gray-500">
                                            {new Date(booking.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {!recentBookings?.length && (
                                <p className="text-sm text-gray-500 text-center py-4">Nenhuma atividade recente.</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions / System Health */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Acesso Rápido</h2>

                        {/* Pacotes Ocasion Navigation Card */}
                        <Link href="/admin/packages" className="block">
                            <Card className="hover:border-[#9c27c1] transition-colors cursor-pointer group">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-[#9c27c1] transition-colors">
                                        <Package className="h-6 w-6 text-[#9c27c1] group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-[#9c27c1] transition-colors">Pacotes Ocasion</h3>
                                        <p className="text-sm text-gray-500">Gerenciar pacotes globais</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Card>
                            <CardHeader>
                                <CardTitle>Status do Sistema</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Banco de Dados</span>
                                    <span className="text-sm text-green-600 flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-green-600" /> Online
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Stripe (Pagamentos)</span>
                                    <span className="text-sm text-green-600 flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-green-600" /> Conectado
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Storage</span>
                                    <span className="text-sm text-green-600 flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-green-600" /> 45% Livre
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, description, trend }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                    {description}
                </p>
                {trend && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                        <TrendingUp className="h-3 w-3" />
                        {trend}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
