import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AppService } from './app.service';

//{
//   "id": "resp_047a47555877602d006942dbc608bc8197aa4090197f4ed8bd",
//   "object": "response",
//   "created_at": 1765989318,
//   "status": "completed",
//   "background": false,
//   "billing": {
//     "payer": "developer"
//   },
//   "error": null,
//   "incomplete_details": null,
//   "instructions": null,
//   "max_output_tokens": null,
//   "max_tool_calls": null,
//   "model": "gpt-5-nano-2025-08-07",
//   "output": [
//     {
//       "id": "rs_047a47555877602d006942dbc6b2f081978eea3becd6eaaa7e",
//       "type": "reasoning",
//       "summary": []
//     },
//     {
//       "id": "msg_047a47555877602d006942dbcaa5508197b8f3d87c5eb583c0",
//       "type": "message",
//       "status": "completed",
//       "content": [
//         {
//           "type": "output_text",
//           "annotations": [],
//           "logprobs": [],
//           "text": "Under the silver moon, a gentle unicorn curled up in a bed of lavender dreams and whispered goodnight to the sleeping world."
//         }
//       ],
//       "role": "assistant"
//     }
//   ],
//   "parallel_tool_calls": true,
//   "previous_response_id": null,
//   "prompt_cache_key": null,
//   "prompt_cache_retention": null,
//   "reasoning": {
//     "effort": "medium",
//     "summary": null
//   },
//   "safety_identifier": null,
//   "service_tier": "default",
//   "store": true,
//   "temperature": 1,
//   "text": {
//     "format": {
//       "type": "text"
//     },
//     "verbosity": "medium"
//   },
//   "tool_choice": "auto",
//   "tools": [],
//   "top_logprobs": 0,
//   "top_p": 1,
//   "truncation": "disabled",
//   "usage": {
//     "input_tokens": 17,
//     "input_tokens_details": {
//       "cached_tokens": 0
//     },
//     "output_tokens": 287,
//     "output_tokens_details": {
//       "reasoning_tokens": 256
//     },
//     "total_tokens": 304
//   },
//   "user": null,
//   "metadata": {
//
//   },
//   "output_text": "Under the silver moon, a gentle unicorn curled up in a bed of lavender dreams and whispered goodnight to the sleeping world."
// }

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  getHello() {
    // return this.appService.getHello();
    // return this.appService.testLlmService();
    return 'ayo';
  }
}
