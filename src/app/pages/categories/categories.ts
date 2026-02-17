import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Category } from '../../services/supabase.service';

@Component({
  selector: 'app-categories',
  imports: [FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  categories: Category[] = [];
  newCategoryName = '';
  loading = true;
  saving = false;
  error = '';

  constructor(private supabase: SupabaseService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.loading = true;
    this.error = '';
    try {
      this.categories = await this.supabase.getCategories();
    } catch (e: any) {
      this.error = e.message || 'Failed to load categories';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async addCategory() {
    const name = this.newCategoryName.trim();
    if (!name) return;

    this.saving = true;
    this.error = '';
    try {
      const cat = await this.supabase.createCategory(name);
      this.categories.push(cat);
      this.newCategoryName = '';
    } catch (e: any) {
      this.error = e.message || 'Failed to add category';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  async deleteCategory(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await this.supabase.deleteCategory(cat.id!);
      this.categories = this.categories.filter(c => c.id !== cat.id);
    } catch (e: any) {
      alert('Failed to delete: ' + e.message);
    }
    this.cdr.detectChanges();
  }
}
