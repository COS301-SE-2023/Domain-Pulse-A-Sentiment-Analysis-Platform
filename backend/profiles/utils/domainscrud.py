from profileservice import models as domain_models

def create_domain(request, domain_name, domain_description, domain_icon):
    if request.user.is_authenticated:
        domain = domain_models.Domains(name=domain_name, description=domain_description, icon=domain_icon, sources=[])
        domain.save()
        return {"status":"SUCCESS", "id":domain.id, "name":domain.name, "description":domain.description, "icon":domain.icon,"sources":domain.sources}
    else:
        return {"status":"FAILURE"}
    
def remove_domain(request, domain_id):
    if request.user.is_authenticated:
        domain = domain_models.Domains.objects.get(id=domain_id)
        domain.delete()
        return {"status":"SUCCESS"}
    else:
        return {"status":"FAILURE"}

def add_source(request, domain_id,sourceID):
    if request.user.is_authenticated:
        domain = domain_models.Domains.objects.get(id=domain_id)
        domain.sources.append(sourceID)
        domain.save()
        return {"status":"SUCCESS", "id":domain.id, "name":domain.name, "description":domain.description, "icon":domain.icon,"sources":domain.sources}
    else:
        return {"status":"FAILURE"}
    
def get_domain(request, domain_id):
    if request.user.is_authenticated:
        domain = domain_models.Domains.objects.get(id=domain_id)
        if domain is not None:
            return {"status":"SUCCESS", "id":domain.id, "name":domain.name, "description":domain.description, "icon":domain.icon,"sources":domain.sources}
        else:
            return {"status":"FAILURE"}
    else:
        return {"status":"FAILURE"}