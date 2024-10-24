/* eslint-disable @typescript-eslint/no-explicit-any */
type EntityType = 'Category' | 'Event' | 'Order' | 'User';

export const getEntitiesFromResult = <T extends EntityType>(
  result: any,
  entityType: T
): Array<{ type: T, id: string | number }> => {
  if (Array.isArray(result)) {
    return result.map(({ id }) => ({ type: entityType, id }));
  }
  if (result && typeof result === 'object' && 'id' in result) {
    return [{ type: entityType, id: result.id }];
  }
  return [];
};

// Usage examples:
export const getCategoriesFromResult = (result: any) => 
  getEntitiesFromResult(result, 'Category');

export const getEventsFromResult = (result: any) => 
  getEntitiesFromResult(result, 'Event');

export const getOrdersFromResult = (result: any) => 
  getEntitiesFromResult(result, 'Order');

export const getUsersFromResult = (result: any) => 
  getEntitiesFromResult(result, 'User');