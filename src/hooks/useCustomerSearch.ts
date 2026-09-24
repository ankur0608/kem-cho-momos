"use client";

import { useEffect, useState } from "react";

export interface CustomerSuggestion {
  fullName: string;
  mobile: string;
}

export function useCustomerSearch(query: string) {
  const [suggestions, setSuggestions] = useState<CustomerSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/pos/customers?q=${query}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setSuggestions(data.users || []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return { suggestions, loading };
}
