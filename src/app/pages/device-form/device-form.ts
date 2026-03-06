import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupabaseService, Device, Category } from '../../services/supabase.service';

// ~75 common device colors with hex codes
const DEVICE_COLORS: { name: string; hex: string }[] = [
  // Blacks & Grays
  { name: 'Midnight Black', hex: '#1C1C1E' },
  { name: 'Phantom Black', hex: '#1A1A2E' },
  { name: 'Obsidian', hex: '#1D1D1F' },
  { name: 'Graphite', hex: '#535353' },
  { name: 'Space Gray', hex: '#8A8A8E' },
  { name: 'Space Grey', hex: '#8A8A8E' },
  { name: 'Gray', hex: '#8E8E93' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Onyx', hex: '#353839' },
  // Whites & Silvers
  { name: 'White', hex: '#F5F5F7' },
  { name: 'Pearl White', hex: '#F0EAD6' },
  { name: 'Frost White', hex: '#EEF0F2' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Starlight', hex: '#F0E6D3' },
  { name: 'Cream', hex: '#FFFDD0' },
  // Blues
  { name: 'Blue', hex: '#007AFF' },
  { name: 'Midnight Blue', hex: '#191970' },
  { name: 'Pacific Blue', hex: '#1D6FA5' },
  { name: 'Sierra Blue', hex: '#9BB5CE' },
  { name: 'Alpine Blue', hex: '#6BA3BE' },
  { name: 'Ultramarine', hex: '#3F00FF' },
  { name: 'Ocean Blue', hex: '#4F97A3' },
  { name: 'Titanium Blue', hex: '#394F6A' },
  { name: 'Ice Blue', hex: '#A5D8DD' },
  // Greens
  { name: 'Green', hex: '#34C759' },
  { name: 'Midnight Green', hex: '#004953' },
  { name: 'Alpine Green', hex: '#485B4E' },
  { name: 'Sage', hex: '#B2AC88' },
  { name: 'Mint', hex: '#98FB98' },
  { name: 'Forest Green', hex: '#228B22' },
  // Reds & Pinks
  { name: 'Red', hex: '#FF3B30' },
  { name: 'Product Red', hex: '#BF0013' },
  { name: 'Coral', hex: '#FF6F61' },
  { name: 'Pink', hex: '#FF2D55' },
  { name: 'Rose Gold', hex: '#B76E79' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Lilac', hex: '#C8A2C8' },
  // Purples
  { name: 'Purple', hex: '#AF52DE' },
  { name: 'Deep Purple', hex: '#5E35B1' },
  { name: 'Violet', hex: '#7F00FF' },
  // Yellows & Oranges
  { name: 'Yellow', hex: '#FFCC00' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Amber', hex: '#FFBF00' },
  { name: 'Orange', hex: '#FF9500' },
  { name: 'Peach', hex: '#FFDAB9' },
  { name: 'Sunset Gold', hex: '#E8A317' },
  // Titanium / Premium
  { name: 'Natural Titanium', hex: '#8F8A81' },
  { name: 'Titanium', hex: '#878681' },
  { name: 'Titanium Gray', hex: '#76766E' },
  { name: 'Titanium Desert', hex: '#BFB5A3' },
  { name: 'Titanium Black', hex: '#3A3A3C' },
  { name: 'Titanium White', hex: '#E3DFD6' },
  // Bronze / Copper
  { name: 'Bronze', hex: '#CD7F32' },
  { name: 'Copper', hex: '#B87333' },
  // Special
  { name: 'Phantom', hex: '#2E2E38' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Mystic Bronze', hex: '#C4956A' },
  { name: 'Cloud Navy', hex: '#2C3E50' },
  { name: 'Bubblegum', hex: '#FFC1CC' },
];

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
    affiliate_links: [],
    available_colors: [],
  };

  // Temporary string fields for array inputs
  imageUrlsStr = '';
  cameraSamplesStr = '';
  prosStr = '';
  consStr = '';

  // Affiliate links managed as structured array
  affiliateLinks: { name: string; url: string }[] = [];

  // Color picker
  colorSearch = '';
  selectedColors: string[] = [];

  get filteredColors(): { name: string; hex: string }[] {
    if (!this.colorSearch.trim()) return DEVICE_COLORS;
    const q = this.colorSearch.toLowerCase();
    return DEVICE_COLORS.filter(c => c.name.toLowerCase().includes(q));
  }

  constructor(
    private supabase: SupabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
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
        this.affiliateLinks = (d.affiliate_links || []).map(l => ({ name: l.name || '', url: l.url || '' }));
        this.selectedColors = [...(d.available_colors || [])];
      } catch (e: any) {
        this.error = e.message;
      } finally {
        this.loading = false;
        this.cdr.detectChanges();
      }
    }
  }

  async loadCategories() {
    try {
      this.categories = await this.supabase.getCategories();
    } catch {
      // Fallback: categories table might not exist yet
      this.categories = [];
    } finally {
      this.cdr.detectChanges();
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
    this.device.affiliate_links = this.affiliateLinks.filter(l => l.name.trim() && l.url.trim());
    this.device.available_colors = [...this.selectedColors];

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
      this.cdr.detectChanges();
    }
  }

  private parseArray(str: string): string[] {
    return str
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  addAffiliateLink() {
    this.affiliateLinks.push({ name: '', url: '' });
  }

  removeAffiliateLink(index: number) {
    this.affiliateLinks.splice(index, 1);
  }

  // Color management
  addColor(name: string) {
    if (!this.selectedColors.includes(name)) {
      this.selectedColors.push(name);
    }
    this.colorSearch = '';
  }

  removeColor(index: number) {
    this.selectedColors.splice(index, 1);
  }

  isColorSelected(name: string): boolean {
    return this.selectedColors.includes(name);
  }

  getColorHex(name: string): string {
    return DEVICE_COLORS.find(c => c.name === name)?.hex || '#8E8E93';
  }
}
