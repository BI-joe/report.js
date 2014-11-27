import {Renderer} from './renderer/renderer';
import {ChartjsAdapter} from './adapter/chartjsAdapter';
import {JQueryAdapter} from './adapter/jqueryAdapter';

var reportjs = {
  Renderer: Renderer,
  ChartjsAdapter: ChartjsAdapter,
  JQueryAdapter: JQueryAdapter
};

export {reportjs};
