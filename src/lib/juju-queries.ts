import { queryOptions } from "@tanstack/react-query";
import { getCommodity, getCountry, listCommodities, listCountries } from "./juju.functions";

export const countriesQuery = queryOptions({
  queryKey: ["countries"],
  queryFn: () => listCountries(),
  staleTime: 5 * 60 * 1000,
});

export const commoditiesQuery = queryOptions({
  queryKey: ["commodities"],
  queryFn: () => listCommodities(),
  staleTime: 5 * 60 * 1000,
});

export const countryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["country", slug],
    queryFn: () => getCountry({ data: { slug } }),
    staleTime: 5 * 60 * 1000,
  });

export const commodityQuery = (slug: string) =>
  queryOptions({
    queryKey: ["commodity", slug],
    queryFn: () => getCommodity({ data: { slug } }),
    staleTime: 5 * 60 * 1000,
  });
