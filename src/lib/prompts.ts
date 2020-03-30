/**
 * @since 2020-03-25 09:09
 * @author vivaxy
 */
import * as vscode from 'vscode';
const conventionalCommitsTypes = require('conventional-commit-types');

import gitmojis from '../vendors/gitmojis';
import promptTypes, { PROMPT_TYPES, Prompt } from './prompts/prompt-types';
import * as names from '../configs/names';

export type Answers = {
  type: string;
  scope: string;
  gitmoji: string;
  subject: string;
  body: string;
  footer: string;
};

export default async function prompts({
  gitmoji,
  context,
}: {
  gitmoji: boolean;
  context: vscode.ExtensionContext;
}): Promise<Answers> {
  const questions: Prompt[] = [
    {
      type: PROMPT_TYPES.QUICK_PICK,
      name: 'type',
      placeholder: "Select the type of change that you're committing",
      items: Object.keys(conventionalCommitsTypes.types).map(function (type) {
        const { title, description } = conventionalCommitsTypes.types[type];
        return {
          label: type,
          description: title,
          detail: description,
        };
      }),
    },
    {
      type: PROMPT_TYPES.CONFIGURIABLE_QUICK_PICK,
      name: 'scope',
      placeholder: 'Denote the scope of this change',
      workspaceStateKey: names.SCOPES,
      context,
      newItem: {
        label: 'New scope',
        description: 'Add a workspace scope',
      },
      newPlaceholder: 'Create a new scope',
    },
    {
      type: PROMPT_TYPES.QUICK_PICK,
      name: 'gitmoji',
      placeholder: 'Choose a gitmoji',
      items: [
        {
          label: 'none',
          description: '',
          detail: 'No gitmoji',
        },
        ...gitmojis.gitmojis.map(function ({ emoji, code, description }) {
          return {
            label: code,
            description: emoji,
            detail: description,
          };
        }),
      ],
      format(input: string) {
        if (input === 'none') {
          return '';
        }
        return input;
      },
    },
    {
      type: PROMPT_TYPES.INPUT_BOX,
      name: 'subject',
      placeholder: 'Write a short, imperative tense description of the change',
    },
    {
      type: PROMPT_TYPES.INPUT_BOX,
      name: 'body',
      placeholder: 'Provide a longer description of the change',
    },
    {
      type: PROMPT_TYPES.INPUT_BOX,
      name: 'footer',
      placeholder: 'List any breaking changes or issues closed by this change',
    },
  ]
    .filter(function (question) {
      if (gitmoji) {
        return true;
      }
      return question.name !== 'gitmoji';
    })
    .map(function (question, index, array) {
      return {
        ...question,
        step: index + 1,
        totalSteps: array.length,
      };
    });

  const answers: Answers = {
    type: '',
    scope: '',
    gitmoji: '',
    subject: '',
    body: '',
    footer: '',
  };

  for (const question of questions) {
    answers[question.name as keyof Answers] = await promptTypes[question.type](
      // @ts-ignore
      question,
    );
  }
  return answers;
}
