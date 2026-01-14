'use client';

import { useState } from 'react';
import { PRODUCTS } from '@/lib/products';
import { optimizeByM2, optimizeByKg, optimizeByLiters } from '@/lib/utils';
import { MikrocementSystem, Surface, CalculationResult, SurfaceCalculation, SystemProducts } from '@/types';

export default function Calculator() {
  const [system, setSystem] = useState<MikrocementSystem>('natture');
  const [surfaces, setSurfaces] = useState<Surface[]>([
    { 
      id: 1, 
      area: '',
      alapozo: '',
      lakk: '',
      layers: { xl: 0, l: 0, m: 0, s: 0 },
      puLayers: { big: 0, medium: 0, small: 0 }
    }
  ]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const sys = PRODUCTS[system];

  const getTotalArea = () => {
    return surfaces.reduce((sum, s) => sum + (parseFloat(s.area) || 0), 0);
  };

  const addSurface = () => {
    const newId = Math.max(...surfaces.map(s => s.id), 0) + 1;
    setSurfaces([...surfaces, { 
      id: newId, 
      area: '',
      alapozo: '',
      lakk: '',
      layers: { xl: 0, l: 0, m: 0, s: 0 },
      puLayers: { big: 0, medium: 0, small: 0 }
    }]);
  };

  const removeSurface = (id: number) => {
    if (surfaces.length > 1) {
      setSurfaces(surfaces.filter(s => s.id !== id));
    }
  };

  const updateSurface = (id: number, field: string, value: string) => {
    setSurfaces(surfaces.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateSurfaceLayers = (id: number, layerType: string, value: number) => {
    setSurfaces(surfaces.map(s => 
      s.id === id ? { ...s, layers: { ...s.layers, [layerType]: value } } : s
    ));
  };

  const updateSurfacePuLayers = (id: number, layerType: string, value: number) => {
    setSurfaces(surfaces.map(s => 
      s.id === id ? { ...s, puLayers: { ...s.puLayers, [layerType]: value } } : s
    ));
  };

  const validate = () => {
    const errs: string[] = [];
    const totalArea = getTotalArea();

    if (totalArea <= 0) {
      errs.push('Adj meg legalább egy felület területet!');
    }

    surfaces.forEach((s, i) => {
      const area = parseFloat(s.area) || 0;
      if (s.area && area < 0) {
        errs.push(`Felület ${i + 1}: A terület nem lehet negatív!`);
      }

      if (area > 0 && !s.alapozo) {
        errs.push(`Felület ${i + 1}: Válassz alapozót!`);
      }

      if (area > 0 && !s.lakk) {
        errs.push(`Felület ${i + 1}: Válassz lakkot!`);
      }

      if (system === 'natture' && area > 0) {
        const total = s.layers.xl + s.layers.l + s.layers.m + s.layers.s;
        if (total !== 3) {
          errs.push(`Felület ${i + 1}: Pontosan 3 réteg mikrocement kell (jelenleg ${total})!`);
        }
      }

      if (system === 'effectoPU' && area > 0) {
        const total = s.puLayers.big + s.puLayers.medium + s.puLayers.small;
        if (total !== 3) {
          errs.push(`Felület ${i + 1}: Pontosan 3 réteg mikrocement kell (jelenleg ${total})!`);
        }
      }
    });

    if (totalArea > 10000) {
      errs.push('A teljes terület túl nagy (maximum 10000 m²)!');
    }

    setErrors(errs);
    return errs.length === 0;
  };

  // Egy felület számítása
  const calculateSurface = (
    surface: Surface,
    sys: SystemProducts
  ): SurfaceCalculation => {
    const result: SurfaceCalculation = {
      surfaceId: surface.id,
      area: parseFloat(surface.area) || 0,
      system: system,
      layers: [],
      materials: []
    };

    // POOL RENDSZER
    if (system === 'pool') {
      const totalM2 = result.area;
      
      // Arcicem Pool alapozó
      result.materials.push({
        category: 'Arcicem Pool gyanta',
        items: [{ name: 'Arcicem Pool 25L', amount: totalM2 / 200, unit: 'db' }]
      });
      
      // XXL mikrocement
      const xxlKg = totalM2 * sys.mikrocementek!.xxl.kgPerM2;
      result.layers.push('2× XXL');
      result.materials.push({
        category: 'Aquaciment XXL',
        items: [{ name: 'Aquaciment XXL 18kg', amount: xxlKg, unit: 'kg' }]
      });
      
      // XL mikrocement
      const xlKg = totalM2 * sys.mikrocementek!.xl.kgPerM2;
      result.layers.push('1× XL');
      result.materials.push({
        category: 'Aquaciment XL',
        items: [{ name: 'Aquaciment XL 18kg', amount: xlKg, unit: 'kg' }]
      });
      
      // B komponensek
      const xxlLiters = xxlKg * 0.3086;
      const xlLiters = xlKg * 0.408;
      result.materials.push({
        category: 'B komponens',
        items: [
          { name: 'B komp XXL', amount: xxlLiters, unit: 'L' },
          { name: 'B komp XL', amount: xlLiters, unit: 'L' }
        ]
      });
      
      // WT Pool lakk
      const lakkM2 = totalM2 * 2;
      const lakkLiters = lakkM2 * 0.06;
      result.materials.push({
        category: 'Topsealer WT Pool',
        items: [{ name: 'Topsealer WT Pool 5L', amount: lakkLiters, unit: 'L' }]
      });
    }
    
    // NATTURE RENDSZER
    if (system === 'natture') {
      const totalM2 = result.area;
      const lakk = surface.lakk;
      
      if (!lakk) return result;
      
      // Számold össze a rétegeket
      const totalLayers = surface.layers.xl + surface.layers.l + surface.layers.m + surface.layers.s;
      if (totalLayers === 0) return result;
      
      // Minden réteg típushoz
      (['xl', 'l', 'm', 's'] as const).forEach(mikroType => {
        if (surface.layers[mikroType] > 0) {
          const mikroName = mikroType.toUpperCase();
          const layerCount = surface.layers[mikroType];
          result.layers.push(`${layerCount}× ${mikroName}`);
          
          // Mikrocement kg
          const mikroData = sys.mikrocementek![mikroType];
          const mikroKg = totalM2 * layerCount * mikroData.kgPerM2;
          result.materials.push({
            category: `Natture ${mikroName}`,
            items: [{ name: mikroData.name, amount: mikroKg, unit: 'kg' }]
          });
          
          // Gyanta - TÍPUS SZERINT!
          const gyantaliter = mikroKg * mikroData.literPerKg!;
          result.materials.push({
            category: `Natture ${mikroName} gyanta`,
            items: [{ name: `Natture ${mikroName} gyanta`, amount: gyantaliter, unit: 'L' }]
          });
        }
      });
      
      // Háló (mindig, 3% ráhagyással)
      const haloKg = totalM2 * 1.03;
      result.materials.push({
        category: 'Háló',
        items: [{ name: 'Háló 50gr', amount: haloKg, unit: 'kg' }]
      });
      
      // PreSealer
      const lakkData = sys.lakkok[lakk];
      if (lakkData.needPresealer) {
        const preM2 = totalM2 * 2;
        result.materials.push({
          category: 'PreSealer',
          items: [{ name: 'PreSealer', amount: preM2, unit: 'm2' }]
        });
      }
      
      // Lakk
      const lakkLayers = lakkData.needPresealer ? 1 : 2;
      const lakkM2 = totalM2 * lakkLayers;
      result.materials.push({
        category: lakkData.name,
        items: [{ name: lakkData.name, amount: lakkM2, unit: 'm2' }]
      });
    }
    
    return result;
  };

  // Anyagok összesítése és optimalizálása
  const aggregateResults = (
    surfaceCalculations: SurfaceCalculation[],
    sys: SystemProducts
  ): CalculationResult => {
    const aggregated: Record<string, { amount: number; unit: string; category: string }> = {};
    
    // Összesítés
    surfaceCalculations.forEach(surf => {
      surf.materials.forEach(mat => {
        mat.items.forEach(item => {
          const key = `${item.name}_${item.unit}`;
          if (!aggregated[key]) {
            aggregated[key] = { amount: 0, unit: item.unit, category: mat.category };
          }
          aggregated[key].amount += item.amount;
        });
      });
    });
    
    // Kiszerelések optimalizálása és árak
    const res: CalculationResult = {
      items: [],
      total: 0,
      layers: [],
      surfaces: surfaces,
      totalM2: surfaces.reduce((sum, s) => sum + (parseFloat(s.area) || 0), 0)
    };
    
    // Pool - Arcicem Pool alapozó
    if (system === 'pool' && aggregated['Arcicem Pool 25L_db']) {
      const totalDb = Math.ceil(aggregated['Arcicem Pool 25L_db'].amount);
      res.items.push({
        cat: 'Arcicem Pool gyanta (összesített)',
        pkgs: [{ liters: 25, price: 88115, qty: totalDb, name: 'Arcicem Pool 25L' }],
        price: totalDb * 88115
      });
    }
    
    // Pool - XXL mikrocement
    if (system === 'pool' && aggregated['Aquaciment XXL 18kg_kg']) {
      const totalKg = aggregated['Aquaciment XXL 18kg_kg'].amount;
      const pieces = Math.ceil(totalKg / 18);
      res.items.push({
        cat: 'Aquaciment XXL (összesített)',
        pkgs: [{ kg: 18, price: 32480, qty: pieces, name: 'Aquaciment XXL 18kg' }],
        price: pieces * 32480
      });
    }
    
    // Pool - XL mikrocement
    if (system === 'pool' && aggregated['Aquaciment XL 18kg_kg']) {
      const totalKg = aggregated['Aquaciment XL 18kg_kg'].amount;
      const pieces = Math.ceil(totalKg / 18);
      res.items.push({
        cat: 'Aquaciment XL (összesített)',
        pkgs: [{ kg: 18, price: 42660, qty: pieces, name: 'Aquaciment XL 18kg' }],
        price: pieces * 42660
      });
    }
    
    // Pool - B komponensek
    if (system === 'pool' && aggregated['B komp XXL_L']) {
      const totalLiters = aggregated['B komp XXL_L'].amount;
      const pieces25L = Math.ceil(totalLiters / 25);
      res.items.push({
        cat: 'B komponens XXL (összesített)',
        pkgs: [{ liters: 25, price: 88115, qty: pieces25L, name: 'B komp XXL 25L' }],
        price: pieces25L * 88115
      });
    }
    
    if (system === 'pool' && aggregated['B komp XL_L']) {
      const totalLiters = aggregated['B komp XL_L'].amount;
      const pieces25L = Math.ceil(totalLiters / 25);
      res.items.push({
        cat: 'B komponens XL (összesített)',
        pkgs: [{ liters: 25, price: 88030, qty: pieces25L, name: 'B komp XL 25L' }],
        price: pieces25L * 88030
      });
    }
    
    // Pool - WT Pool lakk
    if (system === 'pool' && aggregated['Topsealer WT Pool 5L_L']) {
      const totalLiters = aggregated['Topsealer WT Pool 5L_L'].amount;
      const pieces = Math.ceil(totalLiters / 5);
      res.items.push({
        cat: 'Topsealer WT Pool (összesített)',
        pkgs: [{ liters: 5, price: 76650, qty: pieces, name: 'Topsealer WT Pool 5L' }],
        price: pieces * 76650
      });
    }
    
    // NATTURE - Mikrocement (XL, L, M, S)
    (['XL', 'L', 'M', 'S'] as const).forEach(type => {
      const key = `Natture ${type}`;
      const matchingKeys = Object.keys(aggregated).filter(k => k.startsWith(key) && !k.includes('gyanta'));
      
      if (matchingKeys.length > 0 && system === 'natture') {
        const totalKg = matchingKeys.reduce((sum, k) => sum + aggregated[k].amount, 0);
        const mikroType = type.toLowerCase() as 'xl' | 'l' | 'm' | 's';
        const mikroOptions = sys.mikroOptions![mikroType];
        const pkgs = optimizeByKg(totalKg, mikroOptions);
        
        res.items.push({
          cat: `Natture ${type} (összesített)`,
          pkgs: pkgs.map(p => ({ ...p, name: `Natture ${type} ${p.kg}kg`, qty: p.qty || 0 })),
          price: pkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
        });
      }
    });
    
    // NATTURE - Gyanta (típusonként külön)
    if (system === 'natture') {
      (['XL', 'L', 'M', 'S'] as const).forEach(type => {
        const gyantaKey = `Natture ${type} gyanta_L`;
        
        if (aggregated[gyantaKey]) {
          const totalLiters = aggregated[gyantaKey].amount;
          const gPkgs = optimizeByLiters(totalLiters, sys.gyanta!);
          
          res.items.push({
            cat: `Natture ${type} gyanta (összesített)`,
            pkgs: gPkgs.map(p => ({ ...p, name: `Natture ${type} gyanta ${p.liters}L`, qty: p.qty || 0 })),
            price: gPkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
          });
        }
      });
    }
    
    // NATTURE - Háló
    if (system === 'natture' && aggregated['Háló 50gr_kg']) {
      const totalKg = aggregated['Háló 50gr_kg'].amount;
      const haloPkgs = optimizeByM2(totalKg, sys.halo!);
      
      res.items.push({
        cat: 'Háló (összesített)',
        pkgs: haloPkgs.map(p => ({ ...p, name: `Háló ${p.m2 || p.kg}${p.m2 ? 'm²' : 'kg'}`, qty: p.qty || 0 })),
        price: haloPkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
      });
    }
    
    // NATTURE - PreSealer
    if (system === 'natture' && aggregated['PreSealer_m2']) {
      const totalM2 = aggregated['PreSealer_m2'].amount;
      const prePkgs = optimizeByM2(totalM2, sys.presealer!);
      
      res.items.push({
        cat: 'PreSealer (összesített)',
        pkgs: prePkgs.map(p => ({ ...p, name: `PreSealer ${p.liters}L`, qty: p.qty || 0 })),
        price: prePkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
      });
    }
    
    // NATTURE - Lakkok
    Object.keys(sys.lakkok).forEach(lakkKey => {
      const lakkData = sys.lakkok[lakkKey];
      const matchingKeys = Object.keys(aggregated).filter(k => k.startsWith(lakkData.name));
      
      if (matchingKeys.length > 0 && system === 'natture') {
        const totalM2 = matchingKeys.reduce((sum, k) => sum + aggregated[k].amount, 0);
        const lakkPkgs = optimizeByM2(totalM2, lakkData.options);
        
        res.items.push({
          cat: `${lakkData.name} (összesített)`,
          pkgs: lakkPkgs.map(p => ({ ...p, name: `${lakkData.name} ${p.liters}L`, qty: p.qty || 0 })),
          price: lakkPkgs.reduce((s, p) => s + p.price * (p.qty || 0), 0)
        });
      }
    });
    
    res.total = res.items.reduce((sum, item) => sum + item.price, 0);
    
    return res;
  };

  // Fő számítási függvény
  const calc = () => {
    if (!validate()) return;
    
    // Pool és Natture: Új logika
    if (system === 'pool' || system === 'natture') {
      const surfaceCalculations: SurfaceCalculation[] = [];
      surfaces.filter(s => parseFloat(s.area) > 0).forEach(surface => {
        const surfaceResult = calculateSurface(surface, sys);
        surfaceCalculations.push(surfaceResult);
      });
      
      const aggregatedResult = aggregateResults(surfaceCalculations, sys);
      aggregatedResult.layers = surfaceCalculations.map((sc, idx) => 
        `Felület ${idx + 1} (${sc.area} m²): ${sc.layers.join(', ')}`
      );
      
      setResult(aggregatedResult);
      return;
    }
    
    // TODO: Effecto Quartz és Effecto PU később
    alert('Effecto Quartz és Effecto PU még nincs implementálva az új logikával!');
  };

  const resetCalc = () => {
    setSurfaces([{ 
      id: 1, 
      area: '',
      alapozo: '',
      lakk: '',
      layers: { xl: 0, l: 0, m: 0, s: 0 },
      puLayers: { big: 0, medium: 0, small: 0 }
    }]);
    setResult(null);
    setErrors([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Mikrocement Kalkulátor
            </h1>
            {result && (
              <button
                onClick={resetCalc}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-semibold text-gray-700"
              >
                Új
              </button>
            )}
          </div>

          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-1">Hibák:</h3>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((err, i) => (
                  <li key={i} className="text-red-700 text-sm">{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Mikrocement Rendszer
              </label>
              <select
                value={system}
                onChange={(e) => {
                  setSystem(e.target.value as MikrocementSystem);
                  setSurfaces([{ 
                    id: 1, 
                    area: '',
                    alapozo: '',
                    lakk: '',
                    layers: { xl: 0, l: 0, m: 0, s: 0 },
                    puLayers: { big: 0, medium: 0, small: 0 }
                  }]);
                  setResult(null);
                  setErrors([]);
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition text-gray-900 font-medium bg-white"
              >
                <option value="natture">Natture</option>
                <option value="effectoQuartz">Effecto Quartz</option>
                <option value="effectoPU">Effecto PU</option>
                <option value="pool">Pool</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                Lefedendő Területek
              </label>
              
              <div className="space-y-4">
                {surfaces.map((surface, index) => (
                  <div key={surface.id} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700 w-24">
                            Felület {index + 1}:
                          </span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10000"
                            value={surface.area}
                            onChange={(e) => updateSurface(surface.id, 'area', e.target.value)}
                            className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition text-gray-900 font-semibold bg-white"
                            placeholder="pl. 50"
                          />
                          <span className="text-sm text-gray-700 font-medium">m²</span>
                        </div>
                      </div>
                      
                      {surfaces.length > 1 && (
                        <button
                          onClick={() => removeSurface(surface.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition font-bold"
                          title="Felület törlése"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {parseFloat(surface.area) > 0 && (
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Alapozó (1 réteg):
                        </label>
                        <select 
                          value={surface.alapozo} 
                          onChange={(e) => updateSurface(surface.id, 'alapozo', e.target.value)}
                          className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition text-gray-900 font-medium bg-white"
                        >
                          <option value="">Válassz alapozót...</option>
                          {Object.keys(sys.alapozok).map(k => (
                            <option key={k} value={k}>{sys.alapozok[k].name}</option>
                          ))}
                        </select>
                        {surface.alapozo && sys.alapozok[surface.alapozo].info && (
                          <p className="mt-1 text-xs text-gray-500">
                            {sys.alapozok[surface.alapozo].info}
                          </p>
                        )}
                      </div>
                    )}

                    {system === 'natture' && parseFloat(surface.area) > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Mikrocement rétegek (összesen 3 kell):
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {(['xl','l','m','s'] as const).map(t => (
                            <div key={t} className="bg-white p-2 rounded-lg border border-gray-200">
                              <label className="block text-xs font-medium mb-1 text-gray-700">
                                {sys.mikrocementek![t].name.replace('Natture ', '')}
                              </label>
                              <select
                                value={surface.layers[t]}
                                onChange={(e)=>updateSurfaceLayers(surface.id, t, parseInt(e.target.value))}
                                className="w-full p-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-gray-900 font-medium bg-white"
                              >
                                {[0,1,2,3].map(n=><option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                          Összesen: {surface.layers.xl + surface.layers.l + surface.layers.m + surface.layers.s} / 3 réteg
                        </p>
                      </div>
                    )}

                    {parseFloat(surface.area) > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Lakk (2 réteg):
                        </label>
                        <select 
                          value={surface.lakk} 
                          onChange={(e) => updateSurface(surface.id, 'lakk', e.target.value)}
                          className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition text-gray-900 font-medium bg-white"
                        >
                          <option value="">Válassz lakkot...</option>
                          {Object.keys(sys.lakkok).map(k => (
                            <option key={k} value={k}>{sys.lakkok[k].name}</option>
                          ))}
                        </select>
                        {surface.lakk && sys.lakkok[surface.lakk].info && (
                          <p className="mt-1 text-xs text-gray-500">
                            {sys.lakkok[surface.lakk].info}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={addSurface}
                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl transition font-semibold"
                >
                  <span className="text-xl">+</span>
                  <span>Felület hozzáadása</span>
                </button>
              </div>

              {getTotalArea() > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    Összes terület: {getTotalArea().toFixed(1)} m²
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={calc}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Kalkuláció Készítése
            </button>

            {result && (
              <div className="mt-6 space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                  <h3 className="font-bold text-lg mb-2 text-purple-900">Felületek</h3>
                  <div className="space-y-1 text-sm">
                    {result.surfaces.map((s, i) => (
                      <div key={i} className="flex justify-between">
                        <span>Felület {i + 1}:</span>
                        <span className="font-semibold">{s.area} m²</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-purple-300">
                      <span className="font-bold">Összesen:</span>
                      <span className="font-bold text-purple-700">{result.totalM2.toFixed(1)} m²</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
                  <h3 className="font-bold text-lg mb-3 text-blue-900">
                    Rétegrend
                  </h3>
                  <div className="space-y-2">
                    {result.layers.map((l,i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-700">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {i+1}
                        </span>
                        <span>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">
                    Anyagszükséglet és Árak
                  </h3>
                  <div className="space-y-4">
                    {result.items.map((item,idx) => (
                      <div key={idx} className="pb-4 border-b last:border-0 border-gray-300">
                        <h4 className="font-semibold mb-2 text-gray-800">{item.cat}</h4>
                        <div className="space-y-1">
                          {item.pkgs.map((pkg,i) => (
                            <div key={i} className="flex justify-between text-sm text-gray-700">
                              <span>
                                {pkg.qty}× {pkg.name}
                              </span>
                              <span className="font-medium">
                                {(pkg.price*pkg.qty!).toLocaleString('hu-HU')} Ft
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-300 text-sm">
                          <span className="text-gray-600">Részösszeg:</span>
                          <span className="text-indigo-600">{item.price.toLocaleString('hu-HU')} Ft</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-5 pt-5 border-t-2 border-gray-400">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">VÉGÖSSZEG:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {result.total.toLocaleString('hu-HU')} Ft
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Az árak tartalmazzák az ÁFÁ-t. Munkadíj nem szerepel a kalkulációban.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Topciment Professzionális Mikrocement Rendszerek</p>
          <p className="mt-1">© 2024 - Minden jog fenntartva</p>
        </div>
      </div>
    </div>
  );
}
