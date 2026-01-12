
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
// 1. On définit les types pour nos nouvelles props
interface CustomMessageCardProps {
    title: string;           // Le titre sera une chaîne de caractères
    children: React.ReactNode; // Le contenu (standard pour les composants React)
}

export default function CustomMessageCard({ title, children } : CustomMessageCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
