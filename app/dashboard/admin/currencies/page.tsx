import { getCurrencies } from "@/app/actions/admin-actions";
import { CurrenciesList } from "./_components/currencies-list";


export default async function CurrenciesPage() {
  const currencies = await getCurrencies();
  return <CurrenciesList currencies={currencies} />;
}   