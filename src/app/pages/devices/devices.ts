import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService, Device } from '../../services/supabase.service';

@Component({
  selector: 'app-devices',
  imports: [RouterLink],
  templateUrl: './devices.html',
  styleUrl: './devices.css',
})
export class Devices implements OnInit {
  devices: Device[] = [];
  loading = true;
  error = '';

  constructor(private supabase: SupabaseService, private router: Router, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.loadDevices();
  }

  async loadDevices() {
    this.loading = true;
    this.error = '';
    try {
      this.devices = await this.supabase.getDevices();
    } catch (e: any) {
      this.error = e.message || 'Failed to load devices';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  editDevice(id: string) {
    this.router.navigate(['/devices/edit', id]);
  }

  async deleteDevice(device: Device) {
    if (!confirm(`Delete "${device.name}"? This cannot be undone.`)) return;
    try {
      await this.supabase.deleteDevice(device.id!);
      this.devices = this.devices.filter(d => d.id !== device.id);
    } catch (e: any) {
      alert('Failed to delete: ' + e.message);
    }
    this.cdr.detectChanges();
  }
}
