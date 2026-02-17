import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  constructor(private supabase: SupabaseService, private router: Router) {}

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
