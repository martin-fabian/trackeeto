import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { customEmailValidator } from '../validators/custom-email.validator';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  public form!: FormGroup;

  public ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, customEmailValidator()]),
      password: new FormControl('', Validators.required),
    });
  }

  public login(): void {
    this.authService.login(this.form.value);
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.login();
    }
  }
}
