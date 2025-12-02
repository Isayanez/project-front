import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { ProviderService } from '../../../services/provider.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule, 
    MatButtonModule,
    ReactiveFormsModule, 
    RouterLink
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  private _formBuilder = inject(FormBuilder);
  private _provider = inject(ProviderService);
  private _router = inject(Router);
  private _snackBar = inject(MatSnackBar);

  hidePassword = true;

  form_signup: FormGroup = this._formBuilder.group({
    name: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async signup() {
    if (this.form_signup.invalid) return;

    try {
      // Enviamos los datos al backend
      const response = await this._provider.request('POST', 'auth/signup', this.form_signup.value);
      
      // Si todo sale bien:
      this._snackBar.open('¡Registro exitoso! Por favor inicia sesión.', 'Cerrar', {
        duration: 4000,
        verticalPosition: 'top'
      });

      // Redirigimos al Login
      this._router.navigate(['/auth/sign-in']);

    } catch (error) {
      console.error(error);
    }
  }

}
