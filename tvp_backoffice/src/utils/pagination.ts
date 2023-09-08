import { computed, ref } from 'vue';
import { usePagination } from 'vue-request';

export const useCustomPagination = (
  load: (params: any) => Promise<any>,
  beforeLoad?: (param: any) => any
) => {
  const total = ref(0);
  const column = ref<string>();
  const sort = ref<number>();

  const result = usePagination(async (params: any) => {
    if (beforeLoad) {
      params = beforeLoad(params);
    }

    const {
      current = result.current.value,
      pageSize = result.pageSize.value,
      filters,
    } = params;

    const response = await load({
      skip: (current - 1) * pageSize,
      take: pageSize,
      column: column.value,
      sort: sort.value,
      ...filters,
    });

    if (!response) {
      return [];
    }

    if (Array.isArray(response)) {
      return response;
    }

    total.value = response.total;
    return response.list;
  });

  return {
    ...result,
    pagination: computed(() => ({
      total: total.value,
      current: result.current.value,
      pageSize: result.pageSize.value,
    })),
    search: (filters?: any) => {
      result.run({
        filters,
      });
    },
    paginationChanged: (
      pagination?: TablePagination,
      _?: any,
      sorter?: Sort
    ) => {
      column.value = sorter?.field;
      sort.value = sorter ? (sorter?.order === 'ascend' ? 1 : -1) : undefined;

      result.run({
        current: pagination?.current,
        pageSize: pagination?.pageSize,
      });
    },
  };
};
