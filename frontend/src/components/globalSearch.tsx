"use client";
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    setQuery(e.target.value);
    if (e.target.value.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);

    try {
      const { data } = await axios.get(`http://localhost:8000/api/v1/search?q=${e.target.value}`);
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="relative w-full max-w-lg lg:max-w-md">
      <Input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleSearch}
        className="w-full p-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300"
      />
      {loading && <p className="text-sm text-gray-500 mt-2">Searching...</p>}
      {results && (
        <div className="absolute w-full bg-white border mt-2 rounded-lg shadow-lg z-50">
          <Card className="p-2">
            <CardContent className="space-y-2">
              {results.suggestions.length === 0 ? (
                <p className="text-gray-500 text-sm">No results found.</p>
              ) : (
                results.suggestions.map((item, index) => (
                  <Link key={index} href={item.path} className="block p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                    {item.page}
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
