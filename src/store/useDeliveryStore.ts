import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, getCountFromServer, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface Delivery {
  id: string;
  userId?: string;
  userName?: string;
  senderName?: string;
  recipientName?: string;
  transporter?: string;
  transporterId?: string;
  transporterName?: string;
  transporterPhoto?: string;
  amount?: number;
  price?: number;
  paymentStatus?: string;
  packageSize?: string;
  status?: "Completed" | "In Transit" | "Pending" | "Cancelled";
  createdAt?: { seconds: number } | any;
}


export interface PackageSizeStatItem {
  count: number;
  percentage: number;
}

export interface PackageSizeStats {
  small: PackageSizeStatItem;
  medium: PackageSizeStatItem;
  large: PackageSizeStatItem;
}

export interface WeeklyStatItem {
  day: string;
  count: number;
}

export function useDeliveryStore() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [packageSizeStats, setPackageSizeStats] = useState<PackageSizeStats>({
    small: { count: 0, percentage: 0 },
    medium: { count: 0, percentage: 0 },
    large: { count: 0, percentage: 0 },
  });
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatItem[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all deliveries
      const deliveriesCol = collection(db, "deliveries");
      const deliveriesSnap = await getDocs(deliveriesCol);

      const allDeliveries: Delivery[] = [];
      let calculatedRevenue = 0;
      let smallCount = 0;
      let mediumCount = 0;
      let largeCount = 0;

      // Group counts for current week (Sunday - Saturday)
      const now = new Date();
      const currentSunday = new Date(now);
      currentSunday.setHours(0, 0, 0, 0);
      currentSunday.setDate(now.getDate() - now.getDay());

      const currentSaturday = new Date(currentSunday);
      currentSaturday.setDate(currentSunday.getDate() + 6);
      currentSaturday.setHours(23, 59, 59, 999);

      const dayCounts = {
        Sun: 0,
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
      };

      deliveriesSnap.forEach((doc) => {
        const data = doc.data();
        const delivery: Delivery = {
          id: doc.id,
          ...data,
        };
        allDeliveries.push(delivery);

        // Sum price if paymentStatus is exactly "paid"
        if (data.paymentStatus === "paid") {
          // Fallback to amount if price is not set, cast to number safely
          const priceVal = data.price !== undefined ? Number(data.price) : Number(data.amount) || 0;
          calculatedRevenue += priceVal;
        }

        // Count package sizes
        const size = String(data.packageSize || "").trim().toLowerCase();
        if (size === "small") {
          smallCount++;
        } else if (size === "medium") {
          mediumCount++;
        } else if (size === "large") {
          largeCount++;
        }

        // Parse date for weekly activity stats
        const ts = data.createdAt ?? data.updatedAt;
        let date: Date | null = null;
        if (ts) {
          if (typeof ts.toDate === "function") {
            date = ts.toDate();
          } else if (ts.seconds) {
            date = new Date(ts.seconds * 1000);
          } else if (ts instanceof Date) {
            date = ts;
          } else if (typeof ts === "string" || typeof ts === "number") {
            date = new Date(ts);
          }
        }

        if (date && date >= currentSunday && date <= currentSaturday) {
          const days: ("Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat")[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayName = days[date.getDay()];
          dayCounts[dayName]++;
        }
      });

      // Calculate percentages based on total number of deliveries
      const total = allDeliveries.length;
      const smallPercent = total > 0 ? Math.round((smallCount / total) * 100) : 0;
      const mediumPercent = total > 0 ? Math.round((mediumCount / total) * 100) : 0;
      const largePercent = total > 0 ? Math.round((largeCount / total) * 100) : 0;

      setPackageSizeStats({
        small: { count: smallCount, percentage: smallPercent },
        medium: { count: mediumCount, percentage: mediumPercent },
        large: { count: largeCount, percentage: largePercent },
      });

      setWeeklyStats([
        { day: "Sun", count: dayCounts.Sun },
        { day: "Mon", count: dayCounts.Mon },
        { day: "Tue", count: dayCounts.Tue },
        { day: "Wed", count: dayCounts.Wed },
        { day: "Thu", count: dayCounts.Thu },
        { day: "Fri", count: dayCounts.Fri },
        { day: "Sat", count: dayCounts.Sat },
      ]);

      // Sort by createdAt descending and take top 5
      const sorted = [...allDeliveries].sort((a, b) => {
        const aTime = a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.seconds ?? 0;
        return bTime - aTime;
      });
      const recent = sorted.slice(0, 5);

      // Resolve transporter details (fullname, photoURL)
      const recentWithTransporters = await Promise.all(
        recent.map(async (delivery) => {
          const transporterId = delivery.transporterId ?? delivery.transporter ?? (delivery as any).transporter_id;
          if (
            transporterId &&
            typeof transporterId === "string" &&
            transporterId.trim() !== "" &&
            transporterId.toLowerCase() !== "unassigned"
          ) {
            try {
              const transporterDocRef = doc(db, "transporter", transporterId);
              const transporterDocSnap = await getDoc(transporterDocRef);
              if (transporterDocSnap.exists()) {
                const tData = transporterDocSnap.data();
                const fullname = tData.fullname ?? tData["fullname "] ?? tData.fullName ?? "";
                const photoURL = tData.photoURL ?? tData.photoUrl ?? "";
                return {
                  ...delivery,
                  transporterId,
                  transporterName: String(fullname).trim(),
                  transporterPhoto: photoURL,
                };
              }
            } catch (err) {
              console.error(`Error fetching transporter ${transporterId}:`, err);
            }
          }
          return delivery;
        })
      );

      // Fetch other counts to completely isolate Firestore from Dashboard.tsx
      const [userSnap, transporterSnap] = await Promise.all([
        getCountFromServer(collection(db, "users")),
        getCountFromServer(collection(db, "transporter")),
      ]);

      setTotalRevenue(calculatedRevenue);
      setRecentDeliveries(recentWithTransporters);
      setTotalOrders(allDeliveries.length);
      setActiveDrivers(transporterSnap.data().count);
      setTotalUsers(userSnap.data().count);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not load data. Check Firestore rules or collection names."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    totalRevenue,
    recentDeliveries,
    totalOrders,
    activeDrivers,
    totalUsers,
    packageSizeStats,
    weeklyStats,
    loading,
    error,
    refresh: fetchData,
  };
}
