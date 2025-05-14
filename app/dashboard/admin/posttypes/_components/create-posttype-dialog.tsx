
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { PostTypeForm } from "./posttype-form";

export function CreatePostTypeDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Créer un type</Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Ajouter un type de post</DialogTitle>
            </DialogHeader>
                <PostTypeForm />
            </DialogContent>
        </Dialog>
    )
}