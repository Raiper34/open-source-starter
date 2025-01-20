import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'open-source-lib-starter',
  run: async (toolbox) => {
    const {print: {printHelp}} = toolbox;

    printHelp(toolbox);
  },
}

module.exports = command
