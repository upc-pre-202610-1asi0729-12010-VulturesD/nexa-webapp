import { catalogApiService } from '../../infrastructure/product-catalog/catalog-api';
import { ProductAssembler } from '../../infrastructure/product-catalog/product.assembler';

const mapProductResource = (product) => ProductAssembler.toResource(ProductAssembler.toEntity(product));

/**
 * Catalog application use cases.
 *
 * @summary Exposes catalog operations for the presentation layer.
 */
export const catalogApplication = {
  /**
   * @summary Returns all products.
   * @returns {Promise<Array>}
   */
  getProducts() {
    return catalogApiService.getProducts().then(products => products.map(mapProductResource));
  },

  /**
   * @summary Returns products available for ordering (excludes out-of-stock).
   * @returns {Promise<Array>}
   */
  getAvailableProducts() {
    return catalogApiService.getProducts().then(products =>
      products.map(mapProductResource).filter(p => p.status !== 'out')
    );
  },

  /**
   * @summary Returns a single product by ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getProductById(id) {
    return catalogApiService.getProductById(id).then(mapProductResource);
  },

  /**
   * @summary Returns all categories.
   * @returns {Promise<Array>}
   */
  getCategories() {
    return catalogApiService.getCategories();
  },

  /**
   * @summary Returns all brands.
   * @returns {Promise<Array>}
   */
  getBrands() {
    return catalogApiService.getBrands();
  },
};
