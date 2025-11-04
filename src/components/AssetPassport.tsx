import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssetPassportProps {
  asset: any;
}

export default function AssetPassport({ asset }: AssetPassportProps) {
  if (!asset) return null;

  return (
    <ScrollArea className="h-[60vh] pr-4">
      <div className="space-y-6">
        <section>
          <h3 className="font-semibold text-lg mb-2">Идентификация</h3>
          <div className="grid grid-cols-2 gap-y-1 text-sm">
            <span className="text-muted-foreground">Бренд/Модель</span>
            <span>{asset.model}</span>
            <span className="text-muted-foreground">Год выпуска</span>
            <span>{asset.year}</span>
            <span className="text-muted-foreground">Инвентарный №</span>
            <span>{asset.inventoryNumber}</span>
            <span className="text-muted-foreground">Заводской № ДГУ</span>
            <span>{asset.serialNumber}</span>
            <span className="text-muted-foreground">Серийный № двигателя</span>
            <span>{asset.engineSerial}</span>
            <span className="text-muted-foreground">Серийный № альтернатора</span>
            <span>{asset.alternatorSerial}</span>
          </div>
        </section>

        <Accordion type="multiple">
          <AccordionItem value="electrical">
            <AccordionTrigger>⚡ Электрика</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <span className="text-muted-foreground">Напряжение (кВ)</span>
                <span>{asset.voltage}</span>
                <span className="text-muted-foreground">Частота (Гц)</span>
                <span>{asset.frequency}</span>
                <span className="text-muted-foreground">Кол-во фаз</span>
                <span>{asset.phases}</span>
                <span className="text-muted-foreground">Мощность</span>
                <span>{asset.powerKVA} кВА / {asset.powerKW} кВт</span>
                <span className="text-muted-foreground">Автомат</span>
                <span>{asset.breaker}</span>
                <span className="text-muted-foreground">Номинал АВ</span>
                <span>{asset.breakerAmp}</span>
                <span className="text-muted-foreground">Мотор-привод</span>
                <span>{asset.motorDrive ? "Да" : "Нет"}</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="engine">
            <AccordionTrigger>🚗 Двигатель</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <span className="text-muted-foreground">Модель</span>
                <span>{asset.engineModel}</span>
                <span className="text-muted-foreground">Расход</span>
                <span>{asset.fuelConsumption}</span>
                <span className="text-muted-foreground">Объем масла/ОЖ</span>
                <span>{asset.fluidsVolume}</span>
                <span className="text-muted-foreground">АКБ</span>
                <span>{asset.batteries}</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="usage">
            <AccordionTrigger>🧾 Эксплуатация</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <span className="text-muted-foreground">Моточасы</span>
                <span>{asset.engineHours}</span>
                <span className="text-muted-foreground">Последнее ТО</span>
                <span>{asset.lastService}</span>
                <span className="text-muted-foreground">Следующее ТО</span>
                <span>{asset.nextService}</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="logistics">
            <AccordionTrigger>🚚 Логистика</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <span className="text-muted-foreground">Габариты</span>
                <span>{asset.dimensions}</span>
                <span className="text-muted-foreground">Масса</span>
                <span>{asset.weight}</span>
                <span className="text-muted-foreground">Типоисполнение</span>
                <span>{asset.executionType}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  );
}