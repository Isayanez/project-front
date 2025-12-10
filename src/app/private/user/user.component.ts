import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProviderService } from '../../services/provider.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LocalstorageService } from '../../services/localstorage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  private _fb = inject(FormBuilder);
  private _provider = inject(ProviderService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _snackBar = inject(MatSnackBar);
  private _localstorage: LocalstorageService = inject(LocalstorageService);

  isEditMode = false;
  userId: string | null = null;
  hidePassword = true;
  userRol: number = 0;
  req: any;

  // Formulario
  form: FormGroup = this._fb.group({
    idusers: [''], // Campo oculto para el ID
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    rol: ['', Validators.required],
    password: [''],
  });

  // Solo roles permitidos para crear (SIN CLIENTE)
  roles = [
    { value: 0, viewValue: 'Administrador' },
    { value: 1, viewValue: 'Cajero' },
    { value: 2, viewValue: 'Cocinero' },
  ];

  async ngOnInit() {
    // Verificar si estamos editando (si hay ID en la URL)
    this._route.paramMap.subscribe(async (params) => {
      this.userId = params.get('id');
      if (this.userId) {
        this.isEditMode = true;
        await this.loadUser(this.userId);
      } else {
        this.form.get('password')?.addValidators(Validators.required);
        this.form.get('password')?.updateValueAndValidity();
      }
    });
  }

  async loadUser(id: string) {
    const res = (await this._provider.request('GET', 'user/getUser', {
      id,
    })) as any;
    console.log(res);

    if (res) {
      this.userRol = res.rol;

      this.form.patchValue({
        idusers: res.idusers,
        name: res.name,
        phone: res.phone,
        rol: res.rol,
      });
    }
  }

  async save() {
    if (this.form.invalid) return;

    const endpoint = this.isEditMode ? 'user/updateUser' : 'user/createUser';
    const method = this.isEditMode ? 'PUT' : 'POST';

    const res = (await this._provider.request(
      method,
      endpoint,
      this.form.value
    )) as any;

    if (res && !res.error) {
      this._snackBar.open('Datos guardados correctamente', 'Cerrar', {
        duration: 3000,
      });

      // Si el usuario es cliente (Rol 3) o si el usuario se está editando a sí mismo
      if (this.userRol === 3) {
        const id = this.userId || this.form.value.idusers;

        // Obtenemos la sesión ACTUAL (que tiene el token vivo)
        const currentSession = this._localstorage.getItem('user');

        // Obtenemos los datos NUEVOS de la base de datos
        const updatedUser = (await this._provider.request(
          'GET',
          'user/getUser',
          { id }
        )) as any;
        if (updatedUser) {
          // Si teníamos un token en la sesión vieja, se lo pegamos al objeto nuevo
          if (currentSession && currentSession.token) {
            updatedUser.token = currentSession.token;
          }

          this._localstorage.setItem('user', updatedUser);
        }

        this._router.navigate(['/private/menu']);
      } else {
        this._router.navigate(['/private/user-view']);
      }
    } else {
      this._snackBar.open('Error al guardar', 'Cerrar', { duration: 3000 });
    }
  }
}
