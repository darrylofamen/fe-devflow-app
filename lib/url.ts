import qs from "query-string";

interface FormUrlQueryParams {
  searchParams: string;
  key: string;
  value: string;
}

interface RemoveKeysFromQueryParams {
  searchParams: string;
  keys: string[];
}

export const formUrlQuery = ({ searchParams, key, value }: FormUrlQueryParams) => {
  const queryString = qs.parse(searchParams);

  queryString[key] = value;

  return qs.stringifyUrl({
    url: window.location.pathname,
    query: queryString,
  });
};

export const removeKeysFromQuery = ({ searchParams, keys }: RemoveKeysFromQueryParams) => {
  const queryString = qs.parse(searchParams);

  keys.forEach((key) => delete queryString[key]);

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: queryString,
    },
    { skipNull: true }
  );
};
