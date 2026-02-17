import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private supabase: SupabaseService, private router: Router) {}

  async onSubmit() {
    this.loading = true;
    this.error = '';
    try {
      const { error } = await this.supabase.signIn(this.email, this.password);
      if (error) {
        this.error = error.message;
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (e: any) {
      this.error = e.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
