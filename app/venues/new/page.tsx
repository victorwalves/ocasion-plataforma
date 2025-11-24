import { VenueForm } from "@/components/venues/venue-form";

export default function NewVenuePage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-[#9c27c1]">Cadastrar Novo Espaço</h1>
                <p className="text-muted-foreground mt-2">
                    Preencha as informações abaixo para anunciar seu espaço na Ocasion.
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <VenueForm />
            </div>
        </div>
    );
}
