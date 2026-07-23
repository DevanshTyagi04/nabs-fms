import { useState, useEffect } from 'react';
import { UserService } from '../api/UserService';
import { VendorProfileData } from '../api/UserRepository';

export function useProfile() {
  const [profile, setProfile] = useState<VendorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.getVendorProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (dto: Partial<VendorProfileData>) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await UserService.updateVendorProfile(dto);
      setProfile(updated);
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return { profile, loading, updating, error, refetch: fetchProfile, updateProfile };
}
