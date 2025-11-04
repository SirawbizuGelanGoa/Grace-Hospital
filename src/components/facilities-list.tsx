'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DynamicIcon from "@/lib/icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import NextImage from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import type { Facility } from '@/lib/schema-types';

const FacilitiesList = ({ facilities }: { facilities: Facility[] }) => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFacilityClick = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsModalOpen(true);
  };

  const FacilityCardSkeleton = () => (
    <Card className="shadow-lg flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="flex-grow">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );

  if (!facilities || facilities.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">No facilities listed at this time.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {facilities.map((facility) => (
        <Dialog key={facility.id} open={isModalOpen && selectedFacility?.id === facility.id} onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            setSelectedFacility(null);
          }
        }}>
          <DialogTrigger asChild>
            <Card
              onClick={() => handleFacilityClick(facility)}
              className="shadow-lg flex flex-col cursor-pointer group hover:shadow-xl transition-shadow duration-300 facility-card-wipe-container"
              aria-label={`View details for ${facility.name}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFacilityClick(facility);}}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-4 facility-card-content-ontop">
                <div className="bg-accent text-accent-foreground rounded-full p-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <DynamicIcon name={facility.iconName} className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold text-primary group-hover:text-destructive-foreground transition-colors duration-300">{facility.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow facility-card-content-ontop">
                <p className="text-muted-foreground group-hover:text-destructive-foreground transition-colors duration-300">{facility.description}</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          {selectedFacility && selectedFacility.id === facility.id && (
            <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary">{selectedFacility.name}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                {selectedFacility.imageUrl && (
                  <div className="relative h-64 md:h-80 lg:h-96 w-full rounded-lg overflow-hidden border bg-muted">
                    <NextImage
                      src={selectedFacility.imageUrl}
                      alt={selectedFacility.name}
                      layout="fill"
                      objectFit="cover"
                      unoptimized
                      data-ai-hint={selectedFacility.imageHint || 'facility image'}
                    />
                  </div>
                )}
                <DialogDescription className="text-base text-foreground whitespace-pre-wrap">
                  {selectedFacility.detailedDescription}
                </DialogDescription>
              </div>
            </DialogContent>
          )}
        </Dialog>
      ))}
    </div>
  );
};

export default FacilitiesList;
