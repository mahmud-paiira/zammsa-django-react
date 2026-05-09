from django.core.management.base import BaseCommand
from master_data.models import Commodity, UnitOfMeasure

COMMODITIES = [
    {'code': 'MED-PAR-001', 'name': 'Paracetamol 500mg Tablets', 'cat': 'Pharmaceuticals', 'sub': 'Analgesics', 'uom': 'TABLET'},
    {'code': 'MED-AMO-001', 'name': 'Amoxicillin 250mg Capsules', 'cat': 'Pharmaceuticals', 'sub': 'Antibiotics', 'uom': 'CAPSULE'},
    {'code': 'MED-ART-001', 'name': 'Artemether-Lumefantrine 20/120mg', 'cat': 'Pharmaceuticals', 'sub': 'Antimalarials', 'uom': 'TABLET'},
    {'code': 'MED-ORS-001', 'name': 'Oral Rehydration Salts', 'cat': 'Pharmaceuticals', 'sub': 'Electrolytes', 'uom': 'PACK'},
    {'code': 'MED-INS-001', 'name': 'Insulin 100IU/mL 10mL Vial', 'cat': 'Pharmaceuticals', 'sub': 'Endocrine', 'uom': 'VIAL'},
    {'code': 'MED-VAC-001', 'name': 'Measles-Rubella Vaccine 10-dose Vial', 'cat': 'Pharmaceuticals', 'sub': 'Vaccines', 'uom': 'VIAL'},
    {'code': 'MED-COT-001', 'name': 'Cotrimoxazole 480mg Tablets', 'cat': 'Pharmaceuticals', 'sub': 'Antibiotics', 'uom': 'TABLET'},
    {'code': 'MED-MET-001', 'name': 'Metformin 500mg Tablets', 'cat': 'Pharmaceuticals', 'sub': 'Endocrine', 'uom': 'TABLET'},
    {'code': 'EQP-SYR-001', 'name': '5mL Oral Syringe', 'cat': 'Equipment', 'sub': 'Medical Supplies', 'uom': 'EA'},
    {'code': 'EQP-GLO-001', 'name': 'Latex Examination Gloves (Box of 100)', 'cat': 'Equipment', 'sub': 'PPE', 'uom': 'BOX'},
    {'code': 'EQP-MSK-001', 'name': 'Surgical Face Masks (Box of 50)', 'cat': 'Equipment', 'sub': 'PPE', 'uom': 'BOX'},
    {'code': 'EQP-BED-001', 'name': 'Hospital Bed Complete with Mattress', 'cat': 'Equipment', 'sub': 'Furniture', 'uom': 'EA'},
    {'code': 'EQP-WHL-001', 'name': 'Wheelchair Adult Size', 'cat': 'Equipment', 'sub': 'Mobility', 'uom': 'EA'},
    {'code': 'EQP-THM-001', 'name': 'Digital Thermometer', 'cat': 'Equipment', 'sub': 'Diagnostic', 'uom': 'EA'},
    {'code': 'EQP-BPQ-001', 'name': 'Blood Pressure Monitor Digital', 'cat': 'Equipment', 'sub': 'Diagnostic', 'uom': 'EA'},
    {'code': 'SUP-COT-001', 'name': 'Cotton Wool 500g Roll', 'cat': 'Supplies', 'sub': 'Wound Care', 'uom': 'EA'},
    {'code': 'SUP-BND-001', 'name': 'Crepe Bandage 10cm x 4.5m', 'cat': 'Supplies', 'sub': 'Wound Care', 'uom': 'EA'},
    {'code': 'SUP-SYN-001', 'name': 'Disposable Syringe 5mL', 'cat': 'Supplies', 'sub': 'Injection', 'uom': 'EA'},
    {'code': 'SUP-NED-001', 'name': 'Hypodermic Needle 23G', 'cat': 'Supplies', 'sub': 'Injection', 'uom': 'EA'},
    {'code': 'SUP-IVF-001', 'name': 'IV Fluid Normal Saline 500mL', 'cat': 'Supplies', 'sub': 'IV Therapy', 'uom': 'BOTTLE'},
    {'code': 'SUP-ALC-001', 'name': 'Surgical Spirit 500mL', 'cat': 'Supplies', 'sub': 'Disinfectants', 'uom': 'BOTTLE'},
    {'code': 'SUP-CLN-001', 'name': 'Chlorhexidine 5% Solution 1L', 'cat': 'Supplies', 'sub': 'Disinfectants', 'uom': 'BOTTLE'},
    {'code': 'LAB-TST-001', 'name': 'Malaria RDT Test Kit', 'cat': 'Lab Reagents', 'sub': 'Diagnostic Tests', 'uom': 'EA'},
    {'code': 'LAB-TST-002', 'name': 'HIV Rapid Test Kit', 'cat': 'Lab Reagents', 'sub': 'Diagnostic Tests', 'uom': 'EA'},
    {'code': 'LAB-TST-003', 'name': 'Glucose Test Strips (Box of 50)', 'cat': 'Lab Reagents', 'sub': 'Diagnostic Tests', 'uom': 'BOX'},
    {'code': 'LAB-TST-004', 'name': 'Pregnancy Test Kit', 'cat': 'Lab Reagents', 'sub': 'Diagnostic Tests', 'uom': 'EA'},
    {'code': 'LAB-TST-005', 'name': 'Syphilis RDT Test Kit', 'cat': 'Lab Reagents', 'sub': 'Diagnostic Tests', 'uom': 'EA'},
    {'code': 'LAB-REA-001', 'name': 'EDTA Vacutainer Tube 4mL', 'cat': 'Lab Reagents', 'sub': 'Blood Collection', 'uom': 'EA'},
    {'code': 'LAB-REA-002', 'name': 'Microscope Slide Pre-cleaned', 'cat': 'Lab Reagents', 'sub': 'Microscopy', 'uom': 'BOX'},
    {'code': 'LAB-REA-003', 'name': 'Giemsa Stain 500mL', 'cat': 'Lab Reagents', 'sub': 'Microscopy', 'uom': 'BOTTLE'},
    {'code': 'LAB-REA-004', 'name': 'CD4 Reagent Kit', 'cat': 'Lab Reagents', 'sub': 'Immunology', 'uom': 'SET'},
    {'code': 'OFF-PAP-001', 'name': 'A4 Printing Paper (Ream of 500)', 'cat': 'Office Supplies', 'sub': 'Paper', 'uom': 'EA'},
    {'code': 'OFF-TNR-001', 'name': 'Toner Cartridge HP LaserJet', 'cat': 'Office Supplies', 'sub': 'Consumables', 'uom': 'EA'},
    {'code': 'OFF-PEN-001', 'name': 'Ballpoint Pen Blue (Box of 50)', 'cat': 'Office Supplies', 'sub': 'Stationery', 'uom': 'BOX'},
    {'code': 'OFF-FIL-001', 'name': 'File Folder A4', 'cat': 'Office Supplies', 'sub': 'Filing', 'uom': 'EA'},
    {'code': 'OFF-CHR-001', 'name': 'Office Chair Ergonomic', 'cat': 'Office Supplies', 'sub': 'Furniture', 'uom': 'EA'},
    {'code': 'OFF-DSK-001', 'name': 'Office Desk 1.5m', 'cat': 'Office Supplies', 'sub': 'Furniture', 'uom': 'EA'},
    {'code': 'IT-CMP-001', 'name': 'Desktop Computer Core i5', 'cat': 'IT Equipment', 'sub': 'Computers', 'uom': 'SET'},
    {'code': 'IT-LPT-001', 'name': 'Laptop Core i5 14-inch', 'cat': 'IT Equipment', 'sub': 'Computers', 'uom': 'EA'},
    {'code': 'IT-PRN-001', 'name': 'Laser Printer A4', 'cat': 'IT Equipment', 'sub': 'Printing', 'uom': 'EA'},
    {'code': 'IT-SVR-001', 'name': 'Server Rack-mount', 'cat': 'IT Equipment', 'sub': 'Infrastructure', 'uom': 'EA'},
    {'code': 'IT-NET-001', 'name': 'Network Switch 24-Port', 'cat': 'IT Equipment', 'sub': 'Networking', 'uom': 'EA'},
    {'code': 'IT-UPS-001', 'name': 'UPS 1000VA', 'cat': 'IT Equipment', 'sub': 'Power', 'uom': 'EA'},
    {'code': 'MED-AN-001', 'name': 'Atenolol 50mg Tablets', 'cat': 'Pharmaceuticals', 'sub': 'Cardiovascular', 'uom': 'TABLET'},
    {'code': 'MED-AN-002', 'name': 'Amlodipine 5mg Tablets', 'cat': 'Pharmaceuticals', 'sub': 'Cardiovascular', 'uom': 'TABLET'},
    {'code': 'MED-AN-003', 'name': 'Omeprazole 20mg Capsules', 'cat': 'Pharmaceuticals', 'sub': 'Gastrointestinal', 'uom': 'CAPSULE'},
    {'code': 'MED-AN-004', 'name': 'Diazepam 5mg Tablets', 'cat': 'Pharmaceuticals', 'sub': 'CNS', 'uom': 'TABLET'},
    {'code': 'MED-AN-005', 'name': 'Salbutamol Inhaler 100mcg/dose', 'cat': 'Pharmaceuticals', 'sub': 'Respiratory', 'uom': 'EA'},
    {'code': 'MED-AN-006', 'name': 'Ceftriaxone 1g Injection Vial', 'cat': 'Pharmaceuticals', 'sub': 'Antibiotics', 'uom': 'VIAL'},
]


class Command(BaseCommand):
    help = 'Seed commodity catalog'

    def handle(self, *args, **options):
        for c in COMMODITIES:
            uom = UnitOfMeasure.objects.filter(uom_code=c['uom']).first()
            Commodity.objects.get_or_create(
                commodity_code=c['code'],
                defaults={
                    'commodity_name': c['name'],
                    'category': c['cat'],
                    'sub_category': c['sub'],
                    'unit_of_measure': uom,
                    'is_active': True,
                }
            )
        self.stdout.write(self.style.SUCCESS(f'Created {len(COMMODITIES)} commodities'))
