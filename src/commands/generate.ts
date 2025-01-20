import { GluegunToolbox } from 'gluegun';
import {resolve} from 'path';
import { InspectTreeResult } from 'fs-jetpack/types'
import {camelCase, kebabCase} from 'lodash';

const CUSTOM_FILE_MAPPING = {
  'src/main.ts': ({package_name}) => `src/${package_name}.ts`
}

module.exports = {
  name: 'generate',
  alias: ['g'],
  description: 'Generate new project with user specified name based on chosen template in actual folder with actual node version.',
  run: async (toolbox: GluegunToolbox) => {
    const {
      template: { generate },
      print: { info },
      prompt: { ask },
      filesystem: { list, inspectTree },
    } = toolbox
    const choices = (await list(resolve(__dirname, '../templates')));
    const {name, templateName} = await ask([
      {type: 'text', name: 'name', message: 'What is name of project?'},
      {type: 'select', name: 'templateName', message: 'What template do you want to use?', choices},
    ]);
    const files = getFlatFilesWithPath(inspectTree(resolve(__dirname, '../templates', templateName)).children);
    const npmVersion = (await toolbox.system.run('node -v', { trim: true })).replace('v', '');
    const actualYear = (new Date()).getFullYear();
    const packageName = camelCase(name);
    const package_name = kebabCase(name);
    const PackageName = firstCase(name)
    const props = {npmVersion, actualYear, packageName, package_name, PackageName};
    for (const {name: fileName, path} of files) {
      const template = `${templateName}/${path}${fileName}`;
      const target = `${name}/${getTarget(path, fileName, {package_name})}`;
      await generate({template, target, props});
      info(`Generated file at ${target}`);
    }
  },
}

function getFlatFilesWithPath(files: InspectTreeResult[], path: string = ''): (InspectTreeResult & {path: string})[] {
  return files.reduce((acc, curr) => ([
    ...acc,
    ...(curr.type === 'dir' ? getFlatFilesWithPath(curr.children, `${path}${curr.name}/`) : [{...curr, path}]),
  ]),[]);
}

function getTarget(path: string, fileName: string, config: {package_name}): string {
  const target = `${path}${fileName.replace('.ejs', '')}`;
  return CUSTOM_FILE_MAPPING[target] ? CUSTOM_FILE_MAPPING[target](config) : target;
}

function firstCase(val: string): string {
  const camelCased = camelCase(val)
  return String(camelCased).charAt(0).toUpperCase() + String(camelCased).slice(1);
}
