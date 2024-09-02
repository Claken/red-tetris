import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // const print2DArray = (arr: any) => {
    //   console.log('[');
    //   for (let i = 0; i < arr.length; i++) {
    //     console.log('  [' + arr[i].join(',') + ']');
    //   }
    //   console.log(']');
    // };
    return 'Hello World!';
  }
}
