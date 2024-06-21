import { Directive, Output, input, EventEmitter,HostBinding,HostListener } from '@angular/core';



@Directive({
  selector: '[appFile]'
})
export class FileDirective {


  @Output() onfileDropped = new EventEmitter<any>();



  @HostListener('dragover', ['$event']) onDragover(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }



  @HostListener('dragleave', ['$event']) public onDragleave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }


  @HostListener('drop', ['$event']) public onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.dataTransfer) {
      let files = evt.dataTransfer.files;
      if (files.length > 0) {
        this.onfileDropped.emit(files);
      }
    }
  }








  constructor() { }
}
