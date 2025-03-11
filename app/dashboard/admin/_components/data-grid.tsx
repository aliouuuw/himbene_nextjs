import { Card, CardContent } from "@/components/ui/card";

interface Props<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

export function DataGrid<T>({ items, renderItem }: Props<T>) {
  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Aucun élément disponible
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            {renderItem(item)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}