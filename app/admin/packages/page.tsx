import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Package as PackageIcon, Pencil, Trash2 } from "lucide-react";
import { PackageForm } from "@/components/packages/package-form";
import { DeletePackageButton } from "@/components/packages/delete-package-button";
import { Package } from "@/types";

export const revalidate = 0;

export default async function AdminPackagesPage() {
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

    // 2. Fetch Global Packages (venue_id is null)
    const { data: packages } = await supabase
        .from("packages")
        .select("*")
        .is("venue_id", null)
        .order("created_at", { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Pacotes Ocasion</h1>
                            <p className="text-gray-500 mt-1">Gerencie os pacotes globais disponíveis em todos os espaços</p>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-[#9c27c1] hover:bg-[#8a22ab]">
                                    <Plus className="mr-2 h-4 w-4" /> Novo Pacote
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Novo Pacote Global</DialogTitle>
                                    <DialogDescription>
                                        Este pacote aparecerá em todos os espaços da plataforma.
                                    </DialogDescription>
                                </DialogHeader>
                                <PackageForm />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages?.map((pkg) => (
                        <PackageCard key={pkg.id} pkg={pkg as Package} />
                    ))}
                    {!packages?.length && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            Nenhum pacote global criado ainda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PackageCard({ pkg }: { pkg: Package }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold text-[#9c27c1]">
                        {pkg.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                        {pkg.description}
                    </CardDescription>
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                    <PackageIcon className="h-4 w-4 text-[#9c27c1]" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(pkg.price)}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                            {pkg.price_type === "per_person" ? "/ pessoa" : " fixo"}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Editar Pacote</DialogTitle>
                                </DialogHeader>
                                <PackageForm initialData={pkg} />
                            </DialogContent>
                        </Dialog>
                        <DeletePackageButton packageId={pkg.id} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
