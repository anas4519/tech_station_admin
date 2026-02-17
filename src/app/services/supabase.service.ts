import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Device {
  id?: string;
  name: string;
  brand: string;
  category: string;
  image_url?: string;
  image_urls?: string[];
  release_date?: string;
  price: number;
  short_description?: string;
  // Specs
  processor?: string;
  ram?: string;
  storage?: string;
  display?: string;
  display_size?: string;
  display_resolution?: string;
  refresh_rate?: string;
  battery?: string;
  charging_speed?: string;
  os?: string;
  rear_camera?: string;
  front_camera?: string;
  connectivity?: string;
  weight?: string;
  dimensions?: string;
  water_resistance?: string;
  biometrics?: string;
  // Scores
  overall_score: number;
  performance_score: number;
  camera_score: number;
  battery_score: number;
  display_score: number;
  value_score: number;
  // Camera samples
  camera_samples?: string[];
  // Review
  review_summary?: string;
  pros?: string[];
  cons?: string[];
  // Metadata
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id?: string;
  name: string;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  // ── Auth ──────────────────────────────────────────────

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // ── Devices ───────────────────────────────────────────

  async getDevices() {
    const { data, error } = await this.supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Device[];
  }

  async getDeviceById(id: string) {
    const { data, error } = await this.supabase
      .from('devices')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Device;
  }

  async createDevice(device: Partial<Device>) {
    // Remove id so Supabase auto-generates it
    const { id, created_at, updated_at, ...payload } = device as any;
    const { data, error } = await this.supabase
      .from('devices')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Device;
  }

  async updateDevice(id: string, device: Partial<Device>) {
    const { created_at, updated_at, ...payload } = device as any;
    const { data, error } = await this.supabase
      .from('devices')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Device;
  }

  async deleteDevice(id: string) {
    const { error } = await this.supabase
      .from('devices')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // ── Categories ────────────────────────────────────────

  async getCategories() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data as Category[];
  }

  async createCategory(name: string) {
    const { data, error } = await this.supabase
      .from('categories')
      .insert({ name })
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  }

  async deleteCategory(id: string) {
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
