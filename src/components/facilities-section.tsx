
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DynamicIcon from "@/lib/icons"; 
import { getFacilities, Facility } from '@/lib/mock-data'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import NextImage from 'next/image'; // Using NextImage
import { Skeleton } from '@/components/ui/skeleton';

const FacilitiesSection = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFacilitiesData = async () => {
      setIsLoading(true);
      try {
        const data = await getFacilities();
        setFacilities(data);
      } catch (error) {
        console.error("Failed to fetch facilities:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFacilitiesData();
  }, []);

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

  return (
    <section id="facilities" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Our Facilities</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => <FacilityCardSkeleton key={index} />)}
          </div>
        ) : facilities.length === 0 ? (
          <p className="text-center text-muted-foreground mt-8">No facilities listed at this time.</p>
        ) : (
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
        )}
      </div>
    </section>
  );
};

export default FacilitiesSection;
