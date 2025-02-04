import React, { useState, useEffect } from 'react';
import * as S from './Styled.ListProducts';
import Product from '../../../components/Product/Product';
import Category from './Category/Category';
import DropDown from '../../../components/DropDown/DropDown';
import { useSearchParams } from 'react-router-dom';
import { mainProductsData, searchValue } from '../../../atom';
import { useRecoilValue } from 'recoil';
import { API } from '../../../config';

const ListProducts = () => {
  const mainProductsDataState = useRecoilValue(mainProductsData);
  const searchValues = useRecoilValue(searchValue);
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('new');
  const [sortUrl, setSortUrl] = useState('new');
  const [searchParams, setSearchParams] = useSearchParams();
  const { first, second, third } = mainProductsDataState;
  const firstCategory = searchParams.get('firstCategory');
  const subCategory = searchParams.get('subCategory');
  const lastCategory = searchParams.get('lastCategory');
  const pageNo = searchParams.get('pageNo');
  const limit = searchParams.get('limit');
  const option = searchParams.get('option');

  let categoryUrl = '';
  if (third !== -1) {
    categoryUrl = 'sub/last/';
  } else if (second !== -1) {
    categoryUrl = 'sub/';
  }

  useEffect(() => {
    setSort('new');
    categoryUrl === 'sub/' ? setSortUrl('') : setSortUrl('new');
    searchParams.set('option', 'DESC');
    searchParams.set('pageNo', 1);
    searchParams.set('limit', 10);
    searchParams.set('option', 'DESC');
    searchParams.set('firstCategory', first + 1);
    second !== -1
      ? searchParams.set('subCategory', 2 * first + second + 1)
      : searchParams.delete('subCategory');
    third !== -1
      ? searchParams.set('lastCategory', 4 * first + 2 * second + third + 1)
      : searchParams.delete('lastCategory');
    setSearchParams(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first, second, third]);

  const URL =
    searchValues === ''
      ? `${API.MAIN_CATEGORY}${categoryUrl}${sortUrl}?firstCategory=${firstCategory}&subCategory=${subCategory}&lastCategory=${lastCategory}&pageNo=${pageNo}&limit=${limit}&option=${option}`
      : `${API.MAIN_SEARCH}${searchValues}`;

  useEffect(() => {
    fetch(URL)
      .then(res => res.json())
      .then(data => {
        if (
          data.message === 'INVALID_DATA_INPUT' ||
          data.message === 'List Empty'
        ) {
          return;
        }
        setProducts(data);
      });
  }, [
    firstCategory,
    subCategory,
    lastCategory,
    pageNo,
    limit,
    sortUrl,
    option,
    categoryUrl,
    URL,
  ]);

  const movePage = pageNo => {
    searchParams.set('pageNo', pageNo);
    setSearchParams(searchParams);
  };

  const sortSetting = currentSort => {
    setSort(currentSort);
    searchParams.set('pageNo', 1);
    if (currentSort === 'new') {
      setSortUrl('new');
      searchParams.set('option', 'DESC');
    } else if (currentSort === 'low') {
      setSortUrl('filter');
      searchParams.set('option', 'ASC');
    } else if (currentSort === 'high') {
      setSortUrl('filter');
      searchParams.set('option', 'DESC');
    }
    setSearchParams(searchParams);
  };

  if (products.length === 0) return;
  const itemTotalNum = products[0]?.counts;
  const pageTotalNum = parseInt(itemTotalNum / 10 + (itemTotalNum % 10 > 0));
  return (
    <S.Area>
      <S.Container>
        {mainProductsDataState.first > -1 && <DropDown />}
        {mainProductsDataState.first > -1 && <Category />}
        <S.ItemInfoContainer>
          <S.ItemInfoBox>
            <S.Title>해당 카테고리의 전체상품</S.Title>
            <S.ItemNum>{itemTotalNum}개</S.ItemNum>
          </S.ItemInfoBox>
          <S.SequenceBox>
            <S.Sequence
              isCurrentSort={sort === 'new'}
              onClick={() => sortSetting('new')}
            >
              최신순
            </S.Sequence>
            <S.Sequence
              isCurrentSort={sort === 'low'}
              onClick={() => sortSetting('low')}
            >
              저가순
            </S.Sequence>
            <S.Sequence
              isCurrentSort={sort === 'high'}
              onClick={() => sortSetting('high')}
            >
              고가순
            </S.Sequence>
          </S.SequenceBox>
        </S.ItemInfoContainer>
        <S.ProductContainer>
          {products.length > 0 &&
            products.map(product => {
              return <Product key={product.id} {...product} />;
            })}
        </S.ProductContainer>
        {searchValues.length < 1 && (
          <S.PageNationBox>
            {[...Array(pageTotalNum)].map((_, i) => (
              <S.PageNationNum
                isCurrentPage={Number(pageNo) === i + 1}
                onClick={() => movePage(i + 1, pageNo)}
                key={i}
              >
                {i + 1}
              </S.PageNationNum>
            ))}
          </S.PageNationBox>
        )}
      </S.Container>
    </S.Area>
  );
};

export default ListProducts;
