import Relay from 'react-relay/classic';

export const viewerQuery = {
  viewer: () => Relay.QL`query { viewer }`,
};

export const nodeQuery = {
  node: () => Relay.QL`query { node(id: $id) }`,
};

export const nodeAndViewerQuery = {
  node: () => Relay.QL`query { node(id: $id) }`,
  viewer: () => Relay.QL`query { viewer }`,
};

export const viewerQueryCA = {
  viewer: () => Relay.QL`query { viewer }`,
  viewerWithCA: () => Relay.QL`query RequiresStudy { viewer }`,
};

export const nodeQueryCA = {
  node: () => Relay.QL`query { node(id: $id) }`,
  nodeWithStudy: () => Relay.QL`query RequiresStudy { viewer }`,
};

export const nodeAndViewerQueryCA = {
  node: () => Relay.QL`query { node(id: $id) }`,
  nodeWithStudy: () => Relay.QL`query RequiresStudy { viewer }`,
  viewer: () => Relay.QL`query { viewer }`,
  viewerWithCA: () => Relay.QL`query RequiresStudy { viewer }`,
};
