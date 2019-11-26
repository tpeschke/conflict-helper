import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule} from '@angular/router';
import {MatInputModule} from '@angular/material/input';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDialogModule} from '@angular/material/dialog';
import {MatToolbarModule} from '@angular/material/toolbar';
import { HttpClientModule }    from '@angular/common/http';

import { AppComponent } from './app.component';
import { ConflictFieldComponent } from './conflict-field/conflict-field.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DiceDisplayComponent } from './dice-display/dice-display.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { ToastrModule } from 'ngx-toastr';
import variables from '../variables';
import { RoomCheckComponent } from './room-check/room-check.component';
import { ProfileComponent } from './profile/profile.component';

const config: SocketIoConfig = { url: variables.endpoint, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    ConflictFieldComponent,
    DiceDisplayComponent,
    RoomCheckComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatExpansionModule,
    MatDialogModule,
    MatToolbarModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    RouterModule.forRoot([
      {
         path: ':room',
         component: ConflictFieldComponent
      }
   ]),
   SocketIoModule.forRoot(config)
  ],
  providers: [],
  entryComponents: [
    RoomCheckComponent,
    ProfileComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
