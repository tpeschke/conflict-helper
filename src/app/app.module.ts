import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule} from '@angular/router';

import { AppComponent } from './app.component';
import { ConflictFieldComponent } from './conflict-field/conflict-field.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DiceDisplayComponent } from './dice-display/dice-display.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import variables from '../variables'

const config: SocketIoConfig = { url: variables.endpoint, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    ConflictFieldComponent,
    DiceDisplayComponent
  ],
  imports: [
    BrowserModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatButtonModule,
    RouterModule.forRoot([
      {
         path: ':room',
         component: ConflictFieldComponent
      }
   ]),
   SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
