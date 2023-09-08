import { Rule } from 'ant-design-vue/lib/form';

export const emailRegex =
  /^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]{2,3}$/;

export const identityRegex = /^[A-Za-z0-9]{6,16}$/;

export const passwordRegex =
  /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[~!@#$%^&*()=+|/:;?<>']).*$/;

export const validatePassword = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject('Please input the password.');
  } else if (!value.match(passwordRegex)) {
    return Promise.reject('Please input the collect password.');
  }
  return Promise.resolve();
};

export const setTableParams = (sendData: any, params: any) => {
  sendData.sortType = undefined;
  sendData.column = params.sortField;

  const count = params.results ?? 10;
  const page = params.page ?? 1;
  sendData.skip = count * (page - 1);
  sendData.take = count;

  delete params.page;
  delete params.results;

  return {
    ...params,
    ...sendData,
  };
};

export const setSearchStatus = (selectStatus: ISelectStatus, label: string) => {
  const arr: number[] = [];
  selectStatus[label]?.map((e) => arr.push(e.value));

  return arr;
};

export const onTree = function (
  arrayList: IStructureResponse[],
  rootId: null | string
) {
  const rootNodes: IStructureResponse[] = [];
  const traverse: any = (
    nodes: IStructureResponse[],
    item: { topMemberId: any },
    index: number
  ) => {
    if (nodes instanceof Array) {
      return nodes.some(function (node) {
        if (node.memberId === item.topMemberId) {
          node.children = node.children || [];
          return node.children.push(arrayList.splice(index, 1)[0]);
        }

        return traverse(node.children, item, index);
      });
    }
  };

  while (arrayList.length > 0) {
    arrayList.some(function (item: { topMemberId: string }, index: number) {
      if (item.topMemberId === rootId) {
        return rootNodes.push(arrayList.splice(index, 1)[0]);
      }

      return traverse(rootNodes, item, index);
    });
  }

  return rootNodes;
};
