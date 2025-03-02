import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrencies } from "@/app/actions/admin-actions";
import { format } from "date-fns";

export default async function CurrenciesPage() {
  const currencies = await getCurrencies();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Currency Management</h1>
        <div className="space-x-2">
          <Button variant="outline">Sync Rates</Button>
          <Button>Add Currency</Button>
        </div>
      </div>

      <Table>
        <TableCaption>A list of all currencies and their exchange rates</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Currency</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currencies.map((currency) => (
            <TableRow key={currency.id}>
              <TableCell className="font-medium">{currency.name}</TableCell>
              <TableCell>{currency.symbol}</TableCell>
              <TableCell>{currency.rate}</TableCell>
              <TableCell>{format(new Date(currency.lastUpdated), "PPP")}</TableCell>
              <TableCell>
                <Badge variant={currency.isBase ? "default" : "outline"}>
                  {currency.isBase ? 'Base Currency' : 'Active'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 