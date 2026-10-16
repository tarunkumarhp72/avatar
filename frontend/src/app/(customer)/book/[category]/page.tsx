import React from 'react';
import BookingFlow from './BookingFlow';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return <BookingFlow categorySlug={params.category} />;
}
