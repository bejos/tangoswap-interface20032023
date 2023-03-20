import { ChainId } from '@cryptoscalper/sdk'
const THE_GRAPH = 'http://127.0.0.1:8000';

export const GRAPH_HOST = {
  [ChainId.COREDAO]: THE_GRAPH,
  // [ChainId.COREDAO_AMBER]: THE_GRAPH,
}
