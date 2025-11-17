// @ts-ignore: Ignore missing type declarations for side-effect CSS import
import './App.css';
import React, { createContext, useContext, useReducer, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';

// -------------------- Types --------------------
export type Category = 'Điện tử' | 'Quần áo' | 'Đồ ăn' | 'Sách' | 'Khác';

export interface Product {
  id: number;
  ten: string;
  danhMuc: Category;
  gia: number;
  soLuong: number;
  moTa: string;
}

type State = {
  products: Product[];
  nextId: number;
};

type Action =
  | { type: 'add'; payload: Omit<Product, 'id'> }
  | { type: 'update'; payload: Product }
  | { type: 'delete'; payload: { id: number } }
  | { type: 'set'; payload: Product[] };

// -------------------- Sample Data --------------------
const initialProductsSample: Product[] = [
  { id: 1, ten: 'iPhone 15 Pro', danhMuc: 'Điện tử', gia: 25000000, soLuong: 10, moTa: 'Điện thoại flagship của Apple.' },
  { id: 2, ten: 'Áo Thun Nam', danhMuc: 'Quần áo', gia: 150000, soLuong: 50, moTa: 'Áo thun cotton co dãn.' },
  { id: 3, ten: 'Bánh Mì Việt', danhMuc: 'Đồ ăn', gia: 20000, soLuong: 100, moTa: 'Bánh mì nóng mỗi sáng.' },
  { id: 4, ten: 'Gatsby - Văn học', danhMuc: 'Sách', gia: 120000, soLuong: 20, moTa: 'Tiểu thuyết kinh điển.' },
  { id: 5, ten: 'Tai nghe Bluetooth', danhMuc: 'Điện tử', gia: 800000, soLuong: 25, moTa: 'Tai nghe không dây, pin lâu.' },
  { id: 6, ten: 'Quần Jean Nữ', danhMuc: 'Quần áo', gia: 350000, soLuong: 30, moTa: 'Quần jean co giãn thoải mái.' },
  { id: 7, ten: 'Snack Khoai Tây', danhMuc: 'Đồ ăn', gia: 25000, soLuong: 60, moTa: 'Snack giòn, vị truyền thống.' },
  { id: 8, ten: 'Sách Lập Trình TS', danhMuc: 'Sách', gia: 300000, soLuong: 15, moTa: 'Học TypeScript từ cơ bản đến nâng cao.' },
  { id: 9, ten: 'Sạc Dự Phòng 10k mAh', danhMuc: 'Điện tử', gia: 450000, soLuong: 40, moTa: 'Sạc nhanh, nhỏ gọn.' },
  { id: 10, ten: 'Mũ Lưỡi Trai', danhMuc: 'Quần áo', gia: 120000, soLuong: 45, moTa: 'Mũ thời trang unisex.' },
];

const initialState: State = {
  products: initialProductsSample,
  nextId: initialProductsSample.length + 1,
};

// -------------------- Reducer & Context --------------------
function productReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const newProduct: Product = { id: state.nextId, ...action.payload };
      return { products: [newProduct, ...state.products], nextId: state.nextId + 1 };
    }
    case 'update': {
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    }
    case 'delete': {
      return { ...state, products: state.products.filter((p) => p.id !== action.payload.id) };
    }
    case 'set': {
      return { products: action.payload, nextId: Math.max(1, action.payload.length + 1) };
    }
    default:
      return state;
  }
}

const ProductStateContext = createContext<State | undefined>(undefined);
const ProductDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

export function useProductsState() {
  const ctx = useContext(ProductStateContext);
  if (!ctx) throw new Error('useProductsState must be used within ProductProvider');
  return ctx;
}
export function useProductsDispatch() {
  const ctx = useContext(ProductDispatchContext);
  if (!ctx) throw new Error('useProductsDispatch must be used within ProductProvider');
  return ctx;
}

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);
  return (
    <ProductStateContext.Provider value={state}>
      <ProductDispatchContext.Provider value={dispatch}>{children}</ProductDispatchContext.Provider>
    </ProductStateContext.Provider>
  );
};

// -------------------- Utilities --------------------
function formatCurrency(v: number) {
  return v.toLocaleString('vi-VN') + ' ₫';
}

// -------------------- Components --------------------

const Header: React.FC = () => {
  return (
    <header className="p-4 bg-slate-800 text-white flex items-center justify-between">
      <h1 className="text-xl font-bold">Quản lý sản phẩm</h1>
      <nav className="space-x-3">
        <Link to="/" className="underline">
          Danh sách
        </Link>
        <Link to="/add" className="underline">
          Thêm sản phẩm
        </Link>
      </nav>
    </header>
  );
};

// SearchBar
const SearchBar: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Tìm theo tên..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-2 rounded w-full"
    />
  );
};

// Filter Panel
const FilterPanel: React.FC<{
  category: string | null;
  setCategory: (c: string | null) => void;
  minPrice: string;
  maxPrice: string;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
}> = ({ category, setCategory, minPrice, maxPrice, setMinPrice, setMaxPrice }) => {
  return (
    <div className="space-y-2">
      <div>
        <label className="block">Danh mục</label>
        <select
          value={category ?? ''}
          onChange={(e) => setCategory(e.target.value || null)}
          className="border p-2 rounded w-full"
        >
          <option value="">Tất cả</option>
          <option value="Điện tử">Điện tử</option>
          <option value="Quần áo">Quần áo</option>
          <option value="Đồ ăn">Đồ ăn</option>
          <option value="Sách">Sách</option>
          <option value="Khác">Khác</option>
        </select>
      </div>
      <div>
        <label className="block">Giá thấp nhất</label>
        <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="border p-2 rounded w-full" />
      </div>
      <div>
        <label className="block">Giá cao nhất</label>
        <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="border p-2 rounded w-full" />
      </div>
    </div>
  );
};

// Pagination
const Pagination: React.FC<{
  current: number;
  totalPages: number;
  onPage: (p: number) => void;
}> = ({ current, totalPages, onPage }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-2">
      <button disabled={current === 1} onClick={() => onPage(current - 1)} className="px-3 py-1 border rounded disabled:opacity-50">
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`px-3 py-1 border rounded ${p === current ? 'bg-slate-700 text-white' : ''}`}
        >
          {p}
        </button>
      ))}
      <button disabled={current === totalPages} onClick={() => onPage(current + 1)} className="px-3 py-1 border rounded disabled:opacity-50">
        Next
      </button>
    </div>
  );
};

// ProductCard
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useProductsDispatch();
  const handleDelete = () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      dispatch({ type: 'delete', payload: { id: product.id } });
      navigate('/');
    }
  };
  return (
    <div className="border p-3 rounded shadow-sm">
      <h3 className="font-semibold text-lg">{product.ten}</h3>
      <p className="text-sm">{product.danhMuc} • {formatCurrency(product.gia)} • SL: {product.soLuong}</p>
      <p className="text-sm mt-2">{product.moTa}</p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => navigate(`/products/${product.id}`)} className="px-3 py-1 border rounded">
          Xem
        </button>
        <button onClick={() => navigate(`/edit/${product.id}`)} className="px-3 py-1 border rounded">
          Sửa
        </button>
        <button onClick={handleDelete} className="px-3 py-1 border rounded text-red-600">
          Xóa
        </button>
      </div>
    </div>
  );
};

// Product List Page
const ProductListPage: React.FC = () => {
  const { products } = useProductsState();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(() => {
    let list = products.slice();
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((p) => p.ten.toLowerCase().includes(s));
    }
    if (category) list = list.filter((p) => p.danhMuc === category);
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) list = list.filter((p) => p.gia >= min);
    if (!isNaN(max)) list = list.filter((p) => p.gia <= max);
    return list;
  }, [products, search, category, minPrice, maxPrice]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const visible = filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage);

  // Reset page when filters change
  React.useEffect(() => setPage(1), [search, category, minPrice, maxPrice]);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1"><SearchBar value={search} onChange={setSearch} /></div>
            <Link to="/add" className="px-4 py-2 border rounded">Thêm sản phẩm</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>Tổng: {total} sản phẩm • Trang {pageSafe}/{totalPages}</div>
            <Pagination current={pageSafe} totalPages={totalPages} onPage={setPage} />
          </div>
        </div>
        <aside className="bg-slate-50 p-3 rounded md:col-span-1">
          <FilterPanel
            category={category}
            setCategory={setCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
          />
        </aside>
      </div>
    </div>
  );
};

// Product Detail Page
const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const { products } = useProductsState();
  const product = products.find((p) => p.id === Number(id));
  const navigate = useNavigate();
  if (!product) return (
    <div className="p-4">Sản phẩm không tìm thấy. <button onClick={() => navigate('/')} className="underline">Quay lại</button></div>
  );
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">{product.ten}</h2>
      <p className="mt-2">Danh mục: {product.danhMuc}</p>
      <p>Giá: {formatCurrency(product.gia)}</p>
      <p>Số lượng: {product.soLuong}</p>
      <p className="mt-3">Mô tả: {product.moTa}</p>
      <div className="mt-4">
        <button onClick={() => navigate(`/edit/${product.id}`)} className="px-3 py-1 border rounded mr-2">Sửa</button>
        <button onClick={() => navigate('/')} className="px-3 py-1 border rounded">Quay lại</button>
      </div>
    </div>
  );
};

// Product Form (used for Add & Edit)
const ProductForm: React.FC<{ initial?: Partial<Product>; onSubmit: (val: Omit<Product, 'id'>) => void; submitLabel?: string }> = ({ initial, onSubmit, submitLabel = 'Lưu' }) => {
  const [ten, setTen] = useState(initial?.ten ?? '');
  const [danhMuc, setDanhMuc] = useState<Category>( (initial?.danhMuc ?? 'Điện tử') as Category );
  const [gia, setGia] = useState(initial?.gia?.toString() ?? '');
  const [soLuong, setSoLuong] = useState(initial?.soLuong?.toString() ?? '');
  const [moTa, setMoTa] = useState(initial?.moTa ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!ten.trim()) e.ten = 'Tên sản phẩm bắt buộc.';
    else if (ten.trim().length < 3) e.ten = 'Tên sản phẩm phải có ít nhất 3 ký tự.';
    const g = parseFloat(gia);
    if (isNaN(g) || g <= 0) e.gia = 'Giá phải là số dương.';
    const sl = parseInt(soLuong, 10);
    if (isNaN(sl) || sl < 0) e.soLuong = 'Số lượng phải là số nguyên không âm.';
    if (!danhMuc) e.danhMuc = 'Phải chọn danh mục.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    onSubmit({ ten: ten.trim(), danhMuc, gia: parseFloat(gia), soLuong: parseInt(soLuong, 10), moTa: moTa.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-3">
      <div>
        <label className="block">Tên sản phẩm</label>
        <input value={ten} onChange={(e) => setTen(e.target.value)} className="border p-2 rounded w-full" />
        {errors.ten && <div className="text-red-600 text-sm">{errors.ten}</div>}
      </div>
      <div>
        <label className="block">Danh mục</label>
        <select value={danhMuc} onChange={(e) => setDanhMuc(e.target.value as Category)} className="border p-2 rounded w-full">
          <option value="Điện tử">Điện tử</option>
          <option value="Quần áo">Quần áo</option>
          <option value="Đồ ăn">Đồ ăn</option>
          <option value="Sách">Sách</option>
          <option value="Khác">Khác</option>
        </select>
        {errors.danhMuc && <div className="text-red-600 text-sm">{errors.danhMuc}</div>}
      </div>
      <div>
        <label className="block">Giá</label>
        <input value={gia} onChange={(e) => setGia(e.target.value)} className="border p-2 rounded w-full" />
        {errors.gia && <div className="text-red-600 text-sm">{errors.gia}</div>}
      </div>
      <div>
        <label className="block">Số lượng</label>
        <input value={soLuong} onChange={(e) => setSoLuong(e.target.value)} className="border p-2 rounded w-full" />
        {errors.soLuong && <div className="text-red-600 text-sm">{errors.soLuong}</div>}
      </div>
      <div>
        <label className="block">Mô tả</label>
        <textarea value={moTa} onChange={(e) => setMoTa(e.target.value)} className="border p-2 rounded w-full" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 border rounded">{submitLabel}</button>
      </div>
    </form>
  );
};

// Add Page
const ProductAddPage: React.FC = () => {
  const dispatch = useProductsDispatch();
  const navigate = useNavigate();
  const onSubmit = (val: Omit<Product, 'id'>) => {
    dispatch({ type: 'add', payload: val });
    navigate('/');
  };
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Thêm sản phẩm</h2>
      <ProductForm onSubmit={onSubmit} />
    </div>
  );
};

// Edit Page
const ProductEditPage: React.FC = () => {
  const { id } = useParams();
  const { products } = useProductsState();
  const dispatch = useProductsDispatch();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === Number(id));
  if (!product) return <div className="p-4">Sản phẩm không tìm thấy.</div>;
  const onSubmit = (val: Omit<Product, 'id'>) => {
    dispatch({ type: 'update', payload: { id: product.id, ...val } });
    navigate(`/products/${product.id}`);
  };
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Chỉnh sửa sản phẩm</h2>
      <ProductForm initial={product} onSubmit={onSubmit} submitLabel="Cập nhật" />
    </div>
  );
};

// Root App
const AppRoot: React.FC = () => {
  return (
    <ProductProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Header />
          <main className="p-4">
            <Routes>
              <Route path="/" element={<ProductListPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/add" element={<ProductAddPage />} />
              <Route path="/edit/:id" element={<ProductEditPage />} />
              <Route path="*" element={<div className="p-4">Không tìm thấy trang</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </ProductProvider>
  );
};

export default AppRoot;
