import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupabaseService, Device, Category } from '../../services/supabase.service';

@Component({
  selector: 'app-device-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './device-form.html',
  styleUrl: './device-form.css',
})
export class DeviceForm implements OnInit {
  isEdit = false;
  deviceId = '';
  loading = false;
  saving = false;
  error = '';
  categories: Category[] = [];

  device: Partial<Device> = {
    name: '',
    brand: '',
    category: '',
    price: 0,
    image_url: '',
    image_urls: [],
    release_date: '',
    short_description: '',
    processor: '',
    ram: '',
    storage: '',
    display: '',
    display_size: '',
    display_resolution: '',
    refresh_rate: '',
    battery: '',
    charging_speed: '',
    os: '',
    rear_camera: '',
    front_camera: '',
    connectivity: '',
    weight: '',
    dimensions: '',
    water_resistance: '',
    biometrics: '',
    overall_score: 0,
    performance_score: 0,
    camera_score: 0,
    battery_score: 0,
    display_score: 0,
    value_score: 0,
    camera_samples: [],
    review_summary: '',
    pros: [],
    cons: [],
    is_featured: false,
  };

  // Temporary string fields for array inputs
  imageUrlsStr = '';
  cameraSamplesStr = '';
  prosStr = '';
  consStr = '';

  constructor(
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.deviceId = id;
      this.loading = true;
      try {
        const d = await this.supabase.getDeviceById(id);
        this.device = { ...d };
        this.imageUrlsStr = (d.image_urls || []).join('\n');
        this.cameraSamplesStr = (d.camera_samples || []).join('\n');
        this.prosStr = (d.pros || []).join('\n');
        this.consStr = (d.cons || []).join('\n');
      } catch (e: any) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    }
  }

  async loadCategories() {
    try {
      this.categories = await this.supabase.getCategories();
    } catch {
      // Fallback: categories table might not exist yet
      this.categories = [];
    }
  }

  async onSubmit() {
    this.saving = true;
    this.error = '';

    // Parse arrays from newline-separated strings
    this.device.image_urls = this.parseArray(this.imageUrlsStr);
    this.device.camera_samples = this.parseArray(this.cameraSamplesStr);
    this.device.pros = this.parseArray(this.prosStr);
    this.device.cons = this.parseArray(this.consStr);

    try {
      if (this.isEdit) {
        await this.supabase.updateDevice(this.deviceId, this.device);
      } else {
        await this.supabase.createDevice(this.device);
      }
      this.router.navigate(['/devices']);
    } catch (e: any) {
      this.error = e.message || 'Failed to save device';
    } finally {
      this.saving = false;
    }
  }

  private parseArray(str: string): string[] {
    return str
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }
}
