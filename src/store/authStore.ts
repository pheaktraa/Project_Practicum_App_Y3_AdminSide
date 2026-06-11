import { auth, db } from '../firebase';
import { useState, useCallback } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

export interface User{
  id: string;
  fullname: string;
  email: string;
  phone_number?:  string;
  roles: string;
  photoURL?: string;
  password?: string;
}

export function useGetAllUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);

   const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from 'users' collection
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      // Fetch from 'transporter' collection
      const transportersCollection = collection(db, 'transporter');
      const transportersSnapshot = await getDocs(transportersCollection);
      const transporterData = transportersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      // Separate by role
      const customersData = usersData.filter(user =>
        user.roles?.toLowerCase() === 'user'
      );
      const driversData = transporterData.filter(user =>
        user.roles?.toLowerCase() === 'transporter'
      );

      setCustomers(customersData);
      setDrivers(driversData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      setCustomers([]);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { customers, drivers, loading, error, fetch };
}

/**
 * Fetch only customers (users with 'user' role)
 */
export function useGetCustomers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<User[]>([]);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as User)
        .filter(user => user.roles?.toLowerCase() === 'user');

      setData(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch };
}

/**
 * Fetch only drivers (transporters with 'transporter' role)
 */
export function useGetDrivers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<User[]>([]);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const transportersCollection = collection(db, 'transporter');
      const transportersSnapshot = await getDocs(transportersCollection);
      const transporterData = transportersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as User)
        .filter(user => user.roles?.toLowerCase() === 'transporter');

      setData(transporterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drivers');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch };
}

export function useGetAdminById(adminId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);

  const fetch = useCallback(async () => {
    const idToFetch = adminId || auth.currentUser?.uid;
    
    if (!idToFetch) {
      setError('Admin ID not provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, 'admin', idToFetch);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setAdmin({ id: docSnap.id, ...docSnap.data() } as User);
      } else {
        setError('Admin not found');
      }
    } catch(err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin');
    } finally {
      setLoading(false);
    }
  },  [adminId]);

  // Update function
  const updateAdmin = async (updatedData: Partial<User>) => {
    const idToUpdate = adminId || auth.currentUser?.uid;
    if (!idToUpdate) {
      setError("No user ID found to update");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'admin', idToUpdate);
      
      // Update in Firestore
      await updateDoc(docRef, updatedData);
      
      // Update local state so UI reflects changes immediately
      setAdmin(prev => prev ? { ...prev, ...updatedData } : null);
      
      return true; // Success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false; // Failed
    } finally {
      setLoading(false);
    }
  };

  return { admin, error, loading, fetch, updateAdmin };
}