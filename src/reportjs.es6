import {GridFactory} from 'data/gridFactory';
import {TableRenderer} from 'renderer/table/tableRenderer';
import {OutputHtml} from 'output/outputHtml';
import {Result} from 'result/result';

export class Renderer {

    render(options) {
        let gridFactory = new GridFactory(),
            grid = gridFactory.buildFromJson(options.data);

        let tableRenderer = new TableRenderer(options.rows, options.columns),
            table = tableRenderer.render(grid),
            result = new Result();
        result.addResult(table);

        let outputHtml = new OutputHtml();

        return outputHtml.getHtml(result);
    }

}
