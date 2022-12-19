import { RxStompService } from './../rx-stomp-configs/rx-stomp.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver-es';
import { Subscription } from 'rxjs';
import { Message } from '@stomp/stompjs';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css']
})

export class FileUploaderComponent implements OnInit {
  loading = false
  selectedFile: File
  myForm: FormGroup
  private topicSubscription: Subscription;

  constructor(
    private rxStompService: RxStompService,
    fb: FormBuilder,
    public _snackBar: MatSnackBar
  ) {
    this.myForm = fb.group({
      file: ['', [Validators.required]],
      fileSource: ['',],
    });
  }

  ngOnInit(): void {
    // start consuming
    this.watch()
  }


  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0]
    }

  }

  submit() {

    this.loading = true
    Promise.resolve(this.selectedFile.text()).then(fileContent => {
      const obj: any = {
        name: this.selectedFile.name,
        file: fileContent,
        wing_thikness: 0.01,
        rib_spacing: 1,
        rib_thikness: 0.2,
        shell_thikness: 0.01,
        fuselage_rib_spacing: 1.5
      }
      const objJson = JSON.stringify(obj)

      this.rxStompService.publish({
        destination: destinations.default_exchange_request_queue,
        body: objJson
      });



    }

    )

  }


  downloadFile(data: any, part: number) {
    if(part > 1){
      // TODO: append to file
    }else{
      // TODO: create a new file
    }
    const blob = new Blob([data], { type: 'application/xml' });
    saveAs(blob, `part_${part}.stl`);
  }



  watch() {
    this.topicSubscription = this.rxStompService.watch(destinations.default_exchange_response_queue).subscribe((message: Message) => {
      const part = +message.headers['part']
      const total_chunks = +message.headers['total_chunks']

      if(part === total_chunks){
        this.loading = false
        this._snackBar.open('erfolgreich abgeschlossen', '✓', { duration: 3000 })
      }

      console.log(`${part}/${total_chunks}`)

      if (part) {
        this.downloadFile(message.body, part)
      } else {
        alert("ERROR: siehe Console")
        console.error(message.body)
      }

    });
  }





  ngOnDestroy(): void {
    this.topicSubscription.unsubscribe();
  }

}


const destinations = {
  default_exchange_request_queue: '/queue/cpacs-request',
  default_exchange_response_queue: '/queue/cpacs-response',
  direct_exchange_with_routing_key: '/exchange/nameExchange/routingKey',
  fanout_exchange: '/exchange/myFirstFanoutExchange',
  topic_exchange: '/exchange/myFirstTopicExchange/health.sport',
  headers_exchange: '/exchange/myFirstHeadersExchange',
};
