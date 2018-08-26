import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import 'anychart';
anychart.licenseKey('cristianflores.ee@gmail.com-a9d113a6-b5dd3f27');
import 'anychart/dist/js/anychart-base.min.js';
import 'anychart/dist/js/anychart-ui.min.js';


if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
