import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface DriverPerformanceData {
  id: string;
  fullname?: string;
  fullName?: string;
  email?: string;
  phone_number?: string;
  phoneNumber?: string;
  photoURL?: string;
  photoUrl?: string;
  createdAt?: any;
  totalDeliveries: number;
}

export function usePerformanceStore() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<DriverPerformanceData[]>([]);

  const fetchPerformanceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all documents from the transporter collection
      const transportersCol = collection(db, 'transporter');
      const transportersSnap = await getDocs(transportersCol);
      const allTransporters = transportersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // 2. Fetch all documents from the deliveries collection
      const deliveriesCol = collection(db, 'deliveries');
      const deliveriesSnap = await getDocs(deliveriesCol);
      const allDeliveries = deliveriesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // 3. Create combined array and calculate totalDeliveries
      const combined: DriverPerformanceData[] = allTransporters.map((transporter) => {
        const matchingDeliveries = allDeliveries.filter((delivery) => {
          const transporterId = delivery.transporterId ?? delivery.transporter ?? delivery.transporter_id;
          return transporterId === transporter.id;
        });

        return {
          id: transporter.id,
          fullname: transporter.fullname ?? transporter.fullName,
          fullName: transporter.fullName ?? transporter.fullname,
          email: transporter.email,
          phone_number: transporter.phone_number ?? transporter.phoneNumber,
          phoneNumber: transporter.phoneNumber ?? transporter.phone_number,
          photoURL: transporter.photoURL ?? transporter.photoUrl,
          photoUrl: transporter.photoUrl ?? transporter.photoURL,
          createdAt: transporter.createdAt ?? transporter.updatedAt,
          totalDeliveries: matchingDeliveries.length,
        };
      });

      setDrivers(combined);
    } catch (err: any) {
      console.error('Error fetching driver performance data:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load performance data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  return {
    drivers,
    loading,
    error,
    refresh: fetchPerformanceData,
  };
}
