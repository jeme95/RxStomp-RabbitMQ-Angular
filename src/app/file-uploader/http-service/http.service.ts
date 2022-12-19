import { Injectable } from '@angular/core';
import { interval, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor() { }


  sendCpacsAsFile(data:FormData){
    return interval(1).pipe(
      take(1)
    )
  }
}
