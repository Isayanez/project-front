
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MenuComponent } from './menu/menu.component';
import {MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LocalstorageService } from '../services/localstorage.service';

@Component({
  selector: 'app-private',
  standalone: true,
  imports: [MatSidenavModule, MatIconModule, MenuComponent, MatFormFieldModule,RouterOutlet,RouterLink],
  templateUrl: './private.component.html',
  styleUrl: './private.component.scss'
})
export class PrivateComponent {
  private _localstorage: LocalstorageService = inject(LocalstorageService);
  private _router: Router = inject(Router);
  user: string = '';
  rol: number = 0;
  id: string = '';

  ngOnInit(){
    const userData = this._localstorage.getItem('user');
    if(userData) {
      this.user = userData.name;
      this.rol = userData.rol;
      this.id = userData.idusers; // <--- 2. Obtenemos el ID del storage
    }
  }
  logOut(){

    this._localstorage.clear();

    this._router.navigate(['/auth/sign-in'])
  }
}
